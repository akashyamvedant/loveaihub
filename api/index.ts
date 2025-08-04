// Vercel serverless function entry point
import 'dotenv/config';
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { storage } from "../server/storage.js";
import { setupAuth, isAuthenticated } from "../server/supabaseAuth.js";

const app = express();

// Add CORS and JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize authentication (synchronous)
try {
  setupAuth(app);
  console.log('✓ Authentication setup completed');
} catch (error) {
  console.error('✗ Error setting up auth:', error);
}

// Add simple API routes directly (avoiding complex imports for serverless)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_anon_key: !!process.env.SUPABASE_ANON_KEY,
      database_url: !!process.env.DATABASE_URL
    }
  });
});

// User profile endpoint
app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.currentUser.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Serverless function error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export for Vercel
export default app;