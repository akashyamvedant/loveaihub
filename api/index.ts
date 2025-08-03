// Vercel serverless function entry point
import express from "express";
import { registerRoutes } from "../server/routes";
import { setupAuth } from "../server/supabaseAuth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize authentication
setupAuth(app);

// Setup API routes
registerRoutes(app);

// Export for Vercel
export default app;