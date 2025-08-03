// Vercel serverless function entry point
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routes
registerRoutes(app);

// Export for Vercel
export default app;