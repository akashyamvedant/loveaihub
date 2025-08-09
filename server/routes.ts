import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { a4fApi } from "./services/a4fApi";
import { razorpayService } from "./services/razorpay";
import { imageStorageService } from "./services/imageStorage";
import { insertGenerationSchema, insertBlogPostSchema } from "@shared/schema";
import multer from "multer";
import { join } from "path";
import { access } from "fs/promises";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration for session cookies
  app.use((req, res, next) => {
    const origin = req.get('Origin');

    // Allow same-origin requests and specific development origins
    if (!origin ||
        origin === `${req.protocol}://${req.get('host')}` ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Note: Auth routes are now handled in supabaseAuth.ts

  // Test A4F API connection
  app.get("/api/test-a4f", async (req, res) => {
    try {
      console.log("Testing A4F API connection...");
      const apiKey = process.env.A4F_API_KEY || "ddc-a4f-cd950b4d41874c21acc4792bb0a392d7";
      console.log("A4F API Key (first 10 chars):", apiKey.substring(0, 10) + "...");

      // First test with usage endpoint (lighter test)
      const usageResult = await a4fApi.testConnection();

      res.json({
        success: true,
        message: "A4F API connection successful",
        usage: usageResult,
        apiKey: apiKey.substring(0, 10) + "..." + apiKey.slice(-4)
      });
    } catch (error) {
      console.error("A4F API test failed:", error);
      res.status(500).json({
        success: false,
        message: "A4F API test failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test authentication
  app.get("/api/test-auth", isAuthenticated, async (req: any, res) => {
    try {
      res.json({
        success: true,
        message: "Authentication successful",
        user: {
          id: req.currentUser.id,
          email: req.currentUser.email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authentication test failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test image generation with simple request
  app.post("/api/test-image-generation", async (req, res) => {
    try {
      console.log("Testing image generation...");

      const testRequest = {
        model: "provider-1/FLUX-1-schnell",
        prompt: "A red apple on a white background",
        n: 1,
        size: "512x512",
        quality: "standard",
        style: "natural"
      };

      console.log("Test request:", testRequest);
      const result = await a4fApi.generateImage(testRequest);

      res.json({
        success: true,
        message: "Image generation test successful",
        result: result
      });
    } catch (error) {
      console.error("Image generation test failed:", error);
      res.status(500).json({
        success: false,
        message: "Image generation test failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Image Generation Routes
  app.post("/api/generate/image", isAuthenticated, async (req: any, res) => {
    try {
      console.log("=== IMAGE GENERATION REQUEST ===");
      console.log("User ID:", req.currentUser?.id);
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check generation limits for free users
      if (user.subscriptionType === "free" && (user.generationsUsed || 0) >= (user.generationsLimit || 10)) {
        return res.status(403).json({ 
          message: "Generation limit reached", 
          generationsUsed: user.generationsUsed || 0,
          generationsLimit: user.generationsLimit || 10
        });
      }

      const { model, prompt, enhancePrompt = false, n = 1, size = "1024x1024", quality = "standard", style = "vivid" } = req.body;

      if (!model || !prompt) {
        return res.status(400).json({ message: "Model and prompt are required" });
      }

      console.log("Generation parameters:", { model, prompt, enhancePrompt, n, size, quality, style });

      // Enhance prompt if requested using provider-3/gpt-5
      let finalPrompt = prompt;
      if (enhancePrompt) {
        try {
          console.log("Enhancing prompt with provider-3/gpt-5...");
          finalPrompt = await a4fApi.enhancePrompt(prompt);
          console.log("Enhanced prompt:", finalPrompt);
        } catch (error) {
          console.warn("Prompt enhancement failed, using original prompt:", error);
          finalPrompt = prompt;
        }
      }

      // Generate image using A4F API
      console.log("Calling A4F API for image generation...");
      const result = await a4fApi.generateImage({
        model,
        prompt: finalPrompt,
        n,
        size,
        quality,
        style,
      });

      console.log("A4F API result:", JSON.stringify(result, null, 2));

      // Create generation record in database
      const generation = await storage.createGeneration({
        userId,
        type: "image",
        model,
        prompt: finalPrompt,
        metadata: { 
          originalPrompt: prompt, 
          enhanced: enhancePrompt, 
          enhancedPrompt: finalPrompt !== prompt ? finalPrompt : undefined,
          n, 
          size, 
          quality, 
          style 
        },
        result,
      });

      // Download and store images locally (since A4F images are single-use)
      if (result.data && result.data.length > 0) {
        try {
          console.log("Processing and storing images locally...");
          await imageStorageService.processGenerationImages(generation);
          console.log("Images stored successfully");
        } catch (error) {
          console.error("Error storing images:", error);
          // Continue even if image storage fails
        }
      }

      // Update user's generation count
      await storage.updateUserGenerationsUsed(userId, (user.generationsUsed || 0) + 1);

      console.log("Image generation completed successfully");
      res.json({ generation });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate image"
      });
    }
  });

  // Image Action Routes
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const imageBuffer = await imageStorageService.getStoredImage(filename);
      
      if (!imageBuffer) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  app.post("/api/generations/:id/favorite", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.currentUser.id;
      
      // Get the generation to verify ownership
      const generations = await storage.getGenerationsByUser(userId);
      const generation = generations.find(g => g.id === id);
      
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }

      // Toggle favorite status in metadata
      const currentMetadata = generation.metadata as any || {};
      const isFavorited = !currentMetadata.favorited;
      
      await storage.updateGeneration(id, {
        metadata: {
          ...currentMetadata,
          favorited: isFavorited,
          favoritedAt: isFavorited ? new Date().toISOString() : undefined
        }
      });

      res.json({ success: true, favorited: isFavorited });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  app.delete("/api/generations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.currentUser.id;
      
      // Get the generation to verify ownership
      const generations = await storage.getGenerationsByUser(userId);
      const generation = generations.find(g => g.id === id);
      
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }

      // Mark as deleted instead of actually deleting (soft delete)
      await storage.updateGeneration(id, {
        metadata: {
          ...(generation.metadata as any || {}),
          deleted: true,
          deletedAt: new Date().toISOString()
        }
      });

      res.json({ success: true, message: "Generation deleted successfully" });
    } catch (error) {
      console.error("Error deleting generation:", error);
      res.status(500).json({ message: "Failed to delete generation" });
    }
  });

  app.get("/api/generations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const allGenerations = await storage.getGenerationsByUser(userId);
      
      // Filter out soft-deleted generations
      const activeGenerations = allGenerations.filter(g => {
        const metadata = g.metadata as any || {};
        return !metadata.deleted;
      });

      res.json(activeGenerations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Video Generation Routes
  app.post("/api/generate/video", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const videoGenerationsUsed = user.generationsUsed ?? 0;
      const videoGenerationsLimit = user.generationsLimit ?? 50;
      if (user.subscriptionType === "free" && videoGenerationsUsed >= videoGenerationsLimit) {
        return res.status(403).json({ message: "Generation limit exceeded. Please upgrade to premium." });
      }

      const { model, prompt, ...options } = req.body;

      const generation = await storage.createGeneration({
        userId,
        type: "video",
        model,
        prompt,
        metadata: options,
      });

      try {
        const result = await a4fApi.generateVideo({
          model,
          prompt,
          ...options,
        });

        await storage.updateGeneration(generation.id, {
          status: "completed",
          result,
        });

        if (user.subscriptionType === "free") {
          await storage.updateUserGenerationsUsed(userId, videoGenerationsUsed + 1);
        }

        res.json({ generation: { ...generation, result, status: "completed" } });
      } catch (error) {
        await storage.updateGeneration(generation.id, {
          status: "failed",
          result: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    } catch (error) {
      console.error("Error generating video:", error);
      res.status(500).json({ message: "Failed to generate video" });
    }
  });

  // Chat Completion Routes
  app.post("/api/chat/completions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { model, messages, stream = false, ...options } = req.body;

      if (stream) {
        // Handle streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          // For now, we'll implement a simple non-streaming response
          // In a full implementation, you'd handle the streaming from A4F API
          const result = await a4fApi.chatCompletion({
            model,
            messages,
            stream: false,
            ...options,
          });

          res.write(`data: ${JSON.stringify(result)}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (error) {
          res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n\n`);
          res.end();
        }
      } else {
        const result = await a4fApi.chatCompletion({
          model,
          messages,
          ...options,
        });

        // Log the chat completion
        await storage.createGeneration({
          userId,
          type: "chat",
          model,
          prompt: messages[messages.length - 1]?.content || "",
          metadata: { messages, options },
        });

        res.json(result);
      }
    } catch (error) {
      console.error("Error in chat completion:", error);
      res.status(500).json({ message: "Failed to process chat completion" });
    }
  });

  // Audio Generation Routes
  app.post("/api/generate/audio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { model, input, ...options } = req.body;

      const generation = await storage.createGeneration({
        userId,
        type: "audio",
        model,
        prompt: input,
        metadata: options,
      });

      try {
        const result = await a4fApi.generateAudio({
          model,
          input,
          ...options,
        });

        await storage.updateGeneration(generation.id, {
          status: "completed",
          result,
        });

        res.json({ generation: { ...generation, result, status: "completed" } });
      } catch (error) {
        await storage.updateGeneration(generation.id, {
          status: "failed",
          result: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  // Audio Transcription Routes
  app.post("/api/transcribe", isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { model, language, response_format } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      const generation = await storage.createGeneration({
        userId,
        type: "transcription",
        model,
        prompt: "Audio transcription",
        metadata: { language, response_format, fileName: audioFile.originalname },
      });

      try {
        const result = await a4fApi.transcribeAudio({
          model,
          file: audioFile.buffer,
          language,
          response_format,
        });

        await storage.updateGeneration(generation.id, {
          status: "completed",
          result,
        });

        res.json({ generation: { ...generation, result, status: "completed" } });
      } catch (error) {
        await storage.updateGeneration(generation.id, {
          status: "failed",
          result: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // Image Editing Routes
  app.post("/api/edit/image", isAuthenticated, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mask', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { model, prompt } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.image || !files.image[0]) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const imageFile = files.image[0];
      const maskFile = files.mask ? files.mask[0] : null;

      const generation = await storage.createGeneration({
        userId,
        type: "image_edit",
        model,
        prompt,
        metadata: { 
          imageFileName: imageFile.originalname,
          maskFileName: maskFile?.originalname,
        },
      });

      try {
        const result = await a4fApi.editImage(
          imageFile.buffer,
          maskFile?.buffer || null,
          prompt,
          model
        );

        await storage.updateGeneration(generation.id, {
          status: "completed",
          result,
        });

        res.json({ generation: { ...generation, result, status: "completed" } });
      } catch (error) {
        await storage.updateGeneration(generation.id, {
          status: "failed",
          result: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    } catch (error) {
      console.error("Error editing image:", error);
      res.status(500).json({ message: "Failed to edit image" });
    }
  });

  // Serve stored images
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const { filename } = req.params;

      // Security check: prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename" });
      }

      const imageBuffer = await imageStorageService.getStoredImage(filename);
      if (!imageBuffer) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Set appropriate headers
      const extension = filename.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'webp': 'image/webp',
        'gif': 'image/gif',
      };

      const mimeType = mimeTypes[extension || 'png'] || 'image/png';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  // Generation History
  app.get("/api/generations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      // TEMPORARY: Return empty array due to database connectivity issues
      console.log("BYPASSING DATABASE - returning empty generations array");
      res.json([]);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Delete generation
  app.delete("/api/generations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { id } = req.params;

      // TEMPORARY: Bypass database operations due to connectivity issues
      console.log("BYPASSING DATABASE - delete generation not available temporarily");
      res.json({ message: "Generation delete temporarily disabled due to database connectivity issues" });
    } catch (error) {
      console.error("Error deleting generation:", error);
      res.status(500).json({ message: "Failed to delete generation" });
    }
  });

  // Add to favorites
  app.post("/api/generations/:id/favorite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { id } = req.params;

      // TEMPORARY: Bypass database operations due to connectivity issues
      console.log("BYPASSING DATABASE - favorites not available temporarily");
      res.json({ message: "Favorites temporarily disabled due to database connectivity issues" });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  // Remove from favorites
  app.delete("/api/generations/:id/favorite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const { id } = req.params;

      // TEMPORARY: Bypass database operations due to connectivity issues
      console.log("BYPASSING DATABASE - remove favorites not available temporarily");
      res.json({ message: "Remove favorites temporarily disabled due to database connectivity issues" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Dashboard Statistics
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      // TEMPORARY: Bypass database operations due to connectivity issues
      console.log("BYPASSING DATABASE - returning default dashboard stats");
      const defaultStats = {
        totalGenerations: 0,
        generationsThisMonth: 0,
        favoriteGenerations: 0,
        subscriptionType: "free",
        generationsUsed: 0,
        generationsLimit: 50
      };
      res.json(defaultStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Recent Activity
  app.get("/api/dashboard/recent-activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const limit = parseInt(req.query.limit as string) || 10;
      // TEMPORARY: Bypass database operations due to connectivity issues
      console.log("BYPASSING DATABASE - returning empty recent activity");
      res.json([]);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Usage Analytics
  app.get("/api/dashboard/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const period = req.query.period as string || "7days";
      const analytics = await storage.getUserAnalytics(userId, period);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching usage analytics:", error);
      res.status(500).json({ message: "Failed to fetch usage analytics" });
    }
  });

  // Blog Routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUsageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/admin/blog", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const blogData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost({
        ...blogData,
        authorId: userId,
      });

      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Subscription Routes
  app.post("/api/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create Razorpay customer if needed
      const customer = await razorpayService.createCustomer(
        user.email || "",
        `${user.firstName} ${user.lastName}`.trim()
      );

      // Create subscription
      const subscription = await razorpayService.createSubscription("premium_monthly", customer.id);

      // Store subscription in database
      await storage.createSubscription({
        userId,
        razorpaySubscriptionId: subscription.id,
        planId: "premium_monthly",
        status: subscription.status,
      });

      res.json({ subscription });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // WebSocket for real-time updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different types of real-time requests
        switch (data.type) {
          case 'generation_status':
            // In a real implementation, you'd track generation status
            // and send updates to the client
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
