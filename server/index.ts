console.log("Starting LoveAIHub server...");

(async () => {
  try {
    console.log("Loading modules...");
    
    // Import modules
    const dotenv = await import('dotenv/config');
    console.log("✓ dotenv loaded");
    
    const express = await import('express');
    console.log("✓ express loaded");
    
    const { registerRoutes } = await import('./routes');
    console.log("✓ routes loaded");
    
    let setupVite, serveStatic, log;
    try {
      const viteModule = await import('./vite');
      setupVite = viteModule.setupVite;
      serveStatic = viteModule.serveStatic;
      log = viteModule.log;
      console.log("✓ vite loaded");
    } catch (viteError) {
      console.warn("⚠️ Vite not available, running in API-only mode:", viteError.message);
      setupVite = null;
      serveStatic = null;
      log = (message: string) => console.log(message);
    }

    const app = express.default();
    app.use(express.default.json());
    app.use(express.default.urlencoded({ extended: false }));

    app.use((req: any, res: any, next: any) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson: any, ...args: any[]) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      });

      next();
    });

    console.log("Registering routes...");
    const server = await registerRoutes(app);
    console.log("✓ Routes registered");

    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Setup static file serving for client
    console.log("Setting up file serving...");

    // Serve static files from client directory
    const path = await import('path');
    const clientDir = path.resolve(import.meta.dirname, '..', 'client');

    console.log("Serving client files from:", clientDir);
    app.use(express.default.static(clientDir));

    // Serve the main React app for all non-API routes
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }

      // Serve the React app
      const indexPath = path.resolve(clientDir, 'index.html');
      res.sendFile(indexPath);
    });

    console.log("✓ Static file serving setup complete");

    // Start server
    const port = parseInt(process.env.PORT || '5000', 10);
    console.log(`Starting server on port ${port}...`);
    
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      console.log(`🚀 LoveAIHub server is running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
