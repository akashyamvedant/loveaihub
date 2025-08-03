import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { a4fApi } from "./services/a4fApi";
import { razorpayService } from "./services/razorpay";
import { insertGenerationSchema, insertBlogPostSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Note: Auth routes are now handled in supabaseAuth.ts

  // Image Generation Routes
  app.post("/api/generate/image", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check generation limits
      const generationsUsed = user.generationsUsed ?? 0;
      const generationsLimit = user.generationsLimit ?? 50;
      if (user.subscriptionType === "free" && generationsUsed >= generationsLimit) {
        return res.status(403).json({ message: "Generation limit exceeded. Please upgrade to premium." });
      }

      const { model, prompt, enhancePrompt = false, ...options } = req.body;
      
      // Enhance prompt if requested
      let finalPrompt = prompt;
      if (enhancePrompt) {
        finalPrompt = await a4fApi.enhancePrompt(prompt);
      }

      // Create generation record
      const generation = await storage.createGeneration({
        userId,
        type: "image",
        model,
        prompt: finalPrompt,
        metadata: { originalPrompt: prompt, enhanced: enhancePrompt, options },
      });

      try {
        // Generate image using A4F API
        const result = await a4fApi.generateImage({
          model,
          prompt: finalPrompt,
          ...options,
        });

        // Update generation with result
        await storage.updateGeneration(generation.id, {
          status: "completed",
          result,
        });

        // Update user's generation count
        if (user.subscriptionType === "free") {
          await storage.updateUserGenerationsUsed(userId, generationsUsed + 1);
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
      console.error("Error generating image:", error);
      res.status(500).json({ message: "Failed to generate image" });
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

  // Generation History
  app.get("/api/generations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.currentUser.id;
      const generations = await storage.getGenerationsByUser(userId);
      res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
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
