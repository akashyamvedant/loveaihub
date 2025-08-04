// Vercel serverless function entry point
import 'dotenv/config';
import express from "express";
import { createClient } from '@supabase/supabase-js';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

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

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Authentication middleware
const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Health check endpoint
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

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { redirectUrl } = req.body;
    console.log('Google OAuth request received:', { redirectUrl });
    
    // Always use production callback URL for consistency
    const callbackUrl = 'https://www.loveaihub.com/auth/callback';
    
    console.log('Attempting OAuth with redirect to:', callbackUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        scopes: 'openid email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      console.error('OAuth setup error:', error);
      return res.status(400).json({ message: error.message });
    }

    console.log('OAuth URL generated successfully:', data.url);
    res.json({ url: data.url });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ user: data.user });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// OAuth callback endpoint - CRITICAL for Google OAuth to work
app.get('/auth/callback', async (req, res) => {
  try {
    console.log('OAuth callback received:', {
      query: req.query,
      headers: req.headers,
      url: req.url
    });

    const { code, error: oauthError, access_token, refresh_token } = req.query;

    // Handle OAuth error responses
    if (oauthError) {
      console.error('OAuth error from provider:', oauthError);
      return res.redirect(`https://www.loveaihub.com/?error=${encodeURIComponent(oauthError.toString())}`);
    }

    // Handle direct token response (implicit flow)
    if (access_token) {
      console.log('Direct token received, setting cookie');
      res.cookie('supabase-auth-token', access_token.toString(), {
        httpOnly: false, // Allow frontend access
        secure: true, // HTTPS only
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: '.loveaihub.com'
      });
      return res.redirect("https://www.loveaihub.com/?auth=success");
    }

    // Handle authorization code flow
    if (!code) {
      console.error('No code or access_token in callback. Full query:', JSON.stringify(req.query, null, 2));
      console.error('Full request details:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: req.params,
        query: req.query
      });
      
      // Try to extract from URL fragments (hash parameters)
      const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
      const fragmentCode = urlParams.get('code');
      const fragmentToken = urlParams.get('access_token');
      
      if (fragmentCode) {
        console.log('Found code in URL fragments:', fragmentCode);
        // Process the fragment code
        const { data, error } = await supabase.auth.exchangeCodeForSession(fragmentCode);
        if (!error && data.session) {
          res.cookie('supabase-auth-token', data.session.access_token, {
            httpOnly: false,
            secure: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            domain: '.loveaihub.com'
          });
          return res.redirect("https://www.loveaihub.com/?auth=success");
        }
      }
      
      if (fragmentToken) {
        console.log('Found access_token in URL fragments:', fragmentToken);
        res.cookie('supabase-auth-token', fragmentToken, {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7,
          domain: '.loveaihub.com'
        });
        return res.redirect("https://www.loveaihub.com/?auth=success");
      }
      
      return res.redirect("https://www.loveaihub.com/?error=missing_auth_data");
    }

    console.log('Exchanging code for session:', code);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code.toString());

    if (error) {
      console.error("OAuth callback error:", error);
      return res.redirect(`https://www.loveaihub.com/?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user && data.session) {
      console.log('Session created successfully for user:', data.user.email);
      // Store session data in cookie for frontend access
      res.cookie('supabase-auth-token', data.session.access_token, {
        httpOnly: false, // Allow frontend access
        secure: true, // HTTPS only
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        domain: '.loveaihub.com'
      });

      // Redirect to homepage with success
      res.redirect("https://www.loveaihub.com/?auth=success");
    } else {
      console.error('No user or session in response:', data);
      res.redirect("https://www.loveaihub.com/?error=oauth_failed");
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect("https://www.loveaihub.com/?error=server_error");
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