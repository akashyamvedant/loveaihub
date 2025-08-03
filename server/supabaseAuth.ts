import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Supabase configuration with graceful fallbacks for serverless
let supabase: any = null;

function initializeSupabase() {
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
    }
  }
  return supabase;
}

export { supabase };
export { initializeSupabase };

export function getSession() {
  try {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    
    // Only create PG store if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not available, using memory store");
      const MemoryStore = session.MemoryStore;
      return session({
        secret: process.env.SESSION_SECRET || "8788fdfd5215934707e38407bcb2920b2aa6716b60801fec6ab1ff6ed34cf6d7",
        store: new MemoryStore(),
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: sessionTtl,
        },
      });
    }
    
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    return session({
      secret: process.env.SESSION_SECRET || "8788fdfd5215934707e38407bcb2920b2aa6716b60801fec6ab1ff6ed34cf6d7",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    // Fallback to memory store
    return session({
      secret: process.env.SESSION_SECRET || "8788fdfd5215934707e38407bcb2920b2aa6716b60801fec6ab1ff6ed34cf6d7",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    });
  }
}

export async function setupAuth(app: Express) {
  try {
    app.set("trust proxy", 1);
    app.use(getSession());
    
    // Initialize Supabase
    initializeSupabase();

    // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return res.status(500).json({ message: "Authentication service unavailable" });
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (data.user) {
        // Create user in our database
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: data.user.user_metadata?.avatar_url,
        });

        // Store user session
        (req.session as any).user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        };
      }

      res.json({ 
        user: data.user, 
        session: data.session,
        message: data.user?.email_confirmed_at ? "User created successfully" : "Please check your email to confirm your account"
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sign in endpoint
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return res.status(500).json({ message: "Authentication service unavailable" });
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      if (data.user) {
        // Update user in our database
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          profileImageUrl: data.user.user_metadata?.avatar_url,
        });

        // Store user session
        (req.session as any).user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        };
      }

      res.json({ user: data.user, session: data.session });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sign out endpoint
  app.post("/api/auth/signout", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      
      if (sessionUser?.access_token) {
        // Create a supabase client with the user's token
        const userSupabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${sessionUser.access_token}`
              }
            }
          }
        );
        
        await userSupabase.auth.signOut();
      }

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });

      res.json({ message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;

      if (!sessionUser?.access_token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Create a supabase client with the user's token
      const userSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${sessionUser.access_token}`
            }
          }
        }
      );

      const { data: { user }, error } = await userSupabase.auth.getUser();

      if (error || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user data from our database
      const dbUser = await storage.getUser(user.id);

      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          ...dbUser
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Password reset request endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return res.status(500).json({ message: "Authentication service unavailable" });
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/reset-password`,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update password endpoint
  app.post("/api/auth/update-password", async (req, res) => {
    try {
      const { password } = req.body;
      const sessionUser = (req.session as any).user;

      if (!sessionUser?.access_token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Create a supabase client with the user's token
      const userSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${sessionUser.access_token}`
            }
          }
        }
      );

      const { error } = await userSupabase.auth.updateUser({ password });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Google OAuth login endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      console.log("Google OAuth request received:", req.body);
      
      // Set proper headers for JSON response
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      const { redirectUrl } = req.body;
      const baseUrl = redirectUrl || `${req.protocol}://${req.get('host')}`;
      
      console.log("Attempting OAuth with redirect to:", `${baseUrl}/auth/callback`);
      
      // First check if Supabase credentials are properly configured
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error("Missing Supabase credentials", {
          hasUrl: !!process.env.SUPABASE_URL,
          hasKey: !!process.env.SUPABASE_ANON_KEY
        });
        return res.status(500).json({ 
          message: "Server configuration error: Missing Supabase credentials" 
        });
      }
      
      try {
        // Check if Google OAuth is configured in Supabase
        const supabaseClient = initializeSupabase();
        if (!supabaseClient) {
          return res.status(500).json({ message: "Authentication service unavailable" });
        }

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${baseUrl}/auth/callback`,
          }
        });

        if (error) {
          console.error("Supabase OAuth error:", error);
          
          // More specific error handling
          if (error.message.toLowerCase().includes('provider') || 
              error.message.toLowerCase().includes('not configured') ||
              error.message.toLowerCase().includes('disabled')) {
            return res.status(400).json({ 
              message: "Google OAuth is not configured in Supabase. Please enable Google OAuth provider in your Supabase dashboard under Authentication > Providers."
            });
          }
          
          if (error.message.toLowerCase().includes('invalid') ||
              error.message.toLowerCase().includes('client')) {
            return res.status(400).json({ 
              message: "Google OAuth configuration is invalid. Please check your Google Client ID and Secret in Supabase dashboard."
            });
          }
          
          return res.status(400).json({ message: `OAuth error: ${error.message}` });
        }

        if (!data || !data.url) {
          console.error("No OAuth URL generated, data:", data);
          return res.status(500).json({ message: "Failed to generate OAuth URL - Google provider may not be enabled" });
        }

        console.log("OAuth URL generated successfully:", data.url);
        return res.json({ url: data.url, success: true });
        
      } catch (supabaseError: any) {
        console.error("Supabase API error:", supabaseError);
        return res.status(500).json({ 
          message: `Supabase API error: ${supabaseError.message || 'Unknown error'}` 
        });
      }
      
    } catch (error: any) {
      console.error("Google OAuth endpoint error:", error);
      return res.status(500).json({ 
        message: `Server error: ${error.message || 'Internal server error'}` 
      });
    }
  });

  // OAuth callback endpoint
  app.get("/auth/callback", async (req, res) => {
    try {
      const { code, error: oauthError } = req.query;

      if (oauthError) {
        return res.redirect(`/?error=${encodeURIComponent(oauthError.toString())}`);
      }

      if (!code) {
        return res.redirect("/?error=missing_code");
      }

      const supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return res.redirect("/?error=authentication_unavailable");
      }

      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code.toString());

      if (error) {
        console.error("OAuth callback error:", error);
        return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
      }

      if (data.user && data.session) {
        // Create/update user in our database
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.full_name?.split(' ')[0] || data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || data.user.user_metadata?.last_name,
          profileImageUrl: data.user.user_metadata?.avatar_url,
        });

        // Store user session
        (req.session as any).user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };

        // Redirect to dashboard or homepage
        res.redirect("/");
      } else {
        res.redirect("/?error=oauth_failed");
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/?error=server_error");
    }
  });
  
  } catch (error) {
    console.error('Error setting up authentication routes:', error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const sessionUser = (req.session as any).user;

    if (!sessionUser?.access_token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create a supabase client with the user's token
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${sessionUser.access_token}`
          }
        }
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Add user to request object for use in other routes
    (req as any).currentUser = user;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};