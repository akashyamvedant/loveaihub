import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Supabase configuration with graceful fallbacks for serverless
let supabase: any = null;

function initializeSupabase() {
  if (!supabase) {
    try {
      // Use environment variables with fallback values for migration
      const supabaseUrl = process.env.SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c';
      
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase initialized successfully');
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
    
    // Use DATABASE_URL with fallback value
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.gfrpidhedgqixkgafumc:[AKraj@$5630]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
    
    if (!databaseUrl) {
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
      conString: databaseUrl,
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
  // Handle legacy GET /api/logout requests
  app.get("/api/logout", async (req, res) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
      
      // Redirect to landing page
      res.redirect("/");
    } catch (error) {
      console.error("Logout error:", error);
      res.redirect("/?error=logout_failed");
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      
      if (sessionUser?.access_token) {
        // Create a supabase client with the user's token using fallback values
        const supabaseUrl = process.env.SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c';
        
        const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${sessionUser.access_token}`
            }
          }
        });
        
        await userSupabase.auth.signOut();
      }

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });

      res.json({ message: "Signed out successfully", redirect: "/" });
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
        redirectTo: `https://www.loveaihub.com/reset-password`,
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
      const authHeader = req.headers.authorization;

      console.log("Password update request received:", {
        hasAuthHeader: !!authHeader,
        hasPassword: !!password,
        authHeaderType: authHeader?.split(' ')[0] || 'none'
      });

      // Check for token in Authorization header first (for reset password flow)
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        console.log("Reset password attempt with token:", token.substring(0, 20) + "...");
        
        if (!password) {
          return res.status(400).json({ message: "Password is required" });
        }

        // Use environment variables with secure fallbacks
        const supabaseUrl = process.env.SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c';

        console.log("Using Supabase URL:", supabaseUrl);
        console.log("Anon key available:", !!supabaseAnonKey);

        // Create a fresh Supabase client for the reset password flow
        const resetSupabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });

        console.log("Setting session for password reset...");
        
        // CRITICAL FIX: Use direct token approach instead of setSession for reset tokens
        // Supabase reset tokens have different behavior than regular session tokens
        console.log("Using direct token verification approach for reset password...");
        
        // First verify the token is valid
        const { data: userData, error: userError } = await resetSupabase.auth.getUser(token);
        
        if (userError || !userData?.user) {
          console.error("Token verification failed:", userError?.message || 'No user data');
          return res.status(401).json({ 
            message: "Invalid or expired reset token",
            debug: userError?.message || 'Token verification failed'
          });
        }
        
        console.log("Token is valid for user:", userData.user.email);
        
        // Create authorized client with the verified token
        const authorizedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });
        
        console.log("Attempting password update with verified token...");
        const { data: updateData, error: updateError } = await authorizedSupabase.auth.updateUser({ password });
        
        if (updateError) {
          console.error("Password update failed:", updateError);
          
          // Final fallback: Try using admin client approach
          console.log("Trying admin client fallback...");
          
          try {
            // Check if service role key is available
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            console.log("Service role key available:", !!serviceRoleKey);
            console.log("Service role key length:", serviceRoleKey?.length || 0);
            
            if (!serviceRoleKey) {
              console.error("No service role key available for admin fallback");
              return res.status(400).json({ 
                message: "Failed to update password - authentication service unavailable",
                debug: "No service role key configured"
              });
            }
            
            // Create service role client with proper configuration
            const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
              auth: {
                persistSession: false,
                autoRefreshToken: false
              }
            });
            
            console.log("Attempting admin password update for user ID:", userData.user.id);
            
            // Update password directly using user ID with enhanced error handling
            const { data: adminUpdateData, error: adminUpdateError } = await adminSupabase.auth.admin.updateUserById(
              userData.user.id,
              { 
                password: password,
                email_confirm: true // Ensure email doesn't need re-confirmation
              }
            );
            
            if (adminUpdateError) {
              console.error("Admin update failed:", {
                error: adminUpdateError.message,
                status: adminUpdateError.status,
                details: adminUpdateError
              });
              
              // Try alternative admin approach
              console.log("Trying alternative admin approach...");
              
              const { data: altUpdateData, error: altUpdateError } = await adminSupabase.auth.admin.updateUserById(
                userData.user.id,
                { password }
              );
              
              if (altUpdateError) {
                console.error("Alternative admin update also failed:", altUpdateError);
                return res.status(400).json({ 
                  message: "Failed to update password - please try requesting a new reset link",
                  debug: `Admin auth failed: ${altUpdateError.message}`
                });
              }
              
              console.log("Password updated successfully using alternative admin method");
              return res.json({ 
                message: "Password updated successfully",
                method: "admin_auth_alt",
                user: altUpdateData?.user
              });
            }
            
            console.log("Password updated successfully using admin method for user:", adminUpdateData?.user?.email);
            return res.json({ 
              message: "Password updated successfully",
              method: "admin_auth",
              user: adminUpdateData?.user
            });
          } catch (adminError: any) {
            console.error("Admin client approach failed with exception:", {
              error: adminError?.message || 'Unknown error',
              stack: adminError?.stack
            });
            return res.status(400).json({ 
              message: "Failed to update password - please try requesting a new reset link",
              debug: `Admin exception: ${adminError?.message || 'Unknown error'}`
            });
          }
        }
        
        console.log("Password updated successfully for user:", updateData?.user?.email);
        return res.json({ 
          message: "Password updated successfully",
          method: "direct_token_auth"
        });


      }

      // Fallback to session-based auth for regular authenticated users
      const sessionUser = (req.session as any).user;

      if (!sessionUser?.access_token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Create a supabase client with the user's token
      const userSupabase = createClient(
        process.env.SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co',
        process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c',
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
      
      // Use fallback Supabase credentials for local development
      const supabaseUrl = process.env.SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase credentials");
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
        message: `OAuth error: ${error.message || 'Internal server error'}` 
      });
    }
  });

  // OAuth callback endpoint - Enhanced with email/password fallback
  app.get('/auth/callback', async (req, res) => {
    try {
      console.log('OAuth callback received:', {
        query: req.query,
        headers: req.headers,
        url: req.url
      });

      const { code, error: oauthError, access_token, refresh_token } = req.query;

      // Get the current environment base URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Handle OAuth error responses
      if (oauthError) {
        console.error('OAuth error from provider:', oauthError);
        return res.redirect(`${baseUrl}/?error=${encodeURIComponent(oauthError.toString())}&fallback=email`);
      }

      // Handle direct token response (implicit flow)
      if (access_token) {
        console.log('Direct token received, setting cookie');
        res.cookie('supabase-auth-token', access_token.toString(), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
        // Redirect to root dashboard
        return res.redirect(`${baseUrl}/`);
      }

      // Handle authorization code flow
      if (!code) {
        console.error('No code or access_token in callback. Full query:', JSON.stringify(req.query, null, 2));
        
        // Instead of showing error page, redirect to home with fallback option
        const referer = req.get('referer');
        console.log('OAuth callback failed, redirecting to email authentication fallback');
        
        if (referer && referer.includes('accounts.google.com')) {
          // User came from Google but no code received - redirect to email signup
          return res.redirect(`${baseUrl}/?auth=fallback&message=` + encodeURIComponent("Google sign-in temporarily unavailable. Please use email registration."));
        }
        
        return res.redirect(`${baseUrl}/?error=missing_auth_data&fallback=email`);
      }

      console.log('Exchanging code for session:', code);
      const supabaseClient = initializeSupabase();
      if (!supabaseClient) {
        return res.redirect("/?error=authentication_service_unavailable");
      }

      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code.toString());

      if (error) {
        console.error('Error exchanging code for session:', error);
        return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
      }

      if (!data.session) {
        console.error('No session returned from code exchange');
        return res.redirect("/?error=no_session_created");
      }

      console.log('OAuth successful, user:', data.user?.email);

      // Create/update user in our database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name || data.user.user_metadata?.full_name?.split(' ')[0],
          lastName: data.user.user_metadata?.last_name || data.user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
          profileImageUrl: data.user.user_metadata?.avatar_url,
        });

        // Store user session
        (req.session as any).user = {
          id: data.user.id,
          email: data.user.email,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
      }

      // Redirect to dashboard 
      res.redirect(`${baseUrl}/`);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.redirect(`${baseUrl}/?error=${encodeURIComponent(error.message || 'authentication_error')}`);
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