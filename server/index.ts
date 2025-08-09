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
    
    // const { setupVite, serveStatic, log } = await import('./vite');
    // console.log("✓ vite loaded");

    // Simple log function for now
    const log = (message: string) => console.log(message);

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

    // Setup Vite or static files - temporarily disabled
    console.log("Setting up file serving...");
    // if (app.get("env") === "development") {
    //   await setupVite(app, server);
    //   console.log("✓ Vite setup complete");
    // } else {
    //   serveStatic(app);
    //   console.log("✓ Static files setup complete");
    // }
    console.log("✓ File serving setup skipped (API only mode)");

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
