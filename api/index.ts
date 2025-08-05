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

// Handle legacy GET /api/logout requests
app.get('/api/logout', async (req, res) => {
  try {
    // Clear any auth cookies
    res.clearCookie('supabase-auth-token', { domain: '.loveaihub.com' });
    
    // Redirect to landing page
    res.redirect('https://www.loveaihub.com/');
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('https://www.loveaihub.com/?error=logout_failed');
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Signed out successfully', redirect: '/' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    let token: string | null = null;
    
    // First try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If no Authorization header, try to get token from cookies
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'supabase-auth-token') {
          token = value;
          break;
        }
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification failed:', error);
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
    
    // Use the exact redirect URL that matches Supabase configuration
    const baseUrl = redirectUrl || 'https://www.loveaihub.com';
    const callbackUrl = `${baseUrl}/auth/callback`;
    
    console.log('Attempting OAuth with redirect to:', callbackUrl);
    
    // Use Supabase's built-in OAuth handling with proper redirect flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `https://www.loveaihub.com/auth/callback`,
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

// Process OAuth tokens from client-side (handles hash fragment tokens)
app.post('/api/auth/process-token', async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body;
    console.log('Processing OAuth tokens from client-side');
    
    if (!access_token) {
      return res.status(400).json({ message: 'Missing access token' });
    }

    // Verify the token with Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);
    
    if (userError || !user) {
      console.error('Token verification failed:', userError);
      return res.status(400).json({ message: 'Invalid token' });
    }

    console.log('Token verified successfully for user:', user.email);
    
    // Set secure cookies for the verified tokens
    res.cookie('supabase-auth-token', access_token, {
      httpOnly: false, // Allow frontend access
      secure: true, // HTTPS only
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: '.loveaihub.com'
    });

    if (refresh_token) {
      res.cookie('supabase-refresh-token', refresh_token, {
        httpOnly: true, // More secure for refresh tokens
        secure: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        domain: '.loveaihub.com'
      });
    }

    res.json({ 
      message: 'Authentication successful',
      user: user
    });
  } catch (error) {
    console.error('Token processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// OAuth callback endpoint - handles both code and token flows
app.get('/auth/callback', async (req, res) => {
  try {
    console.log('OAuth callback received:', {
      query: req.query,
      headers: req.headers,
      url: req.url,
      method: req.method,
      fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl
    });

    // Handle both query parameters and URL fragments
    const { 
      code, 
      access_token, 
      refresh_token, 
      expires_in, 
      token_type,
      error: oauthError,
      error_description 
    } = req.query;

    console.log('Extracted OAuth parameters:', {
      hasCode: !!code,
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      hasError: !!oauthError,
      errorDescription: error_description
    });

    // Handle OAuth error responses
    if (oauthError) {
      console.error('OAuth error from provider:', { oauthError, error_description });
      return res.redirect(`https://www.loveaihub.com/?error=${encodeURIComponent(oauthError.toString())}`);
    }

    // Handle direct token response (implicit flow) - This is what Supabase typically uses
    if (access_token) {
      console.log('Direct token received from Supabase OAuth, processing...');
      
      try {
        // Verify the token with Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser(access_token.toString());
        
        if (userError || !user) {
          console.error('Token verification failed:', userError);
          return res.redirect("https://www.loveaihub.com/?error=invalid_token");
        }

        console.log('Token verified successfully for user:', user.email);
        
        // Set secure cookie with the verified token
        res.cookie('supabase-auth-token', access_token.toString(), {
          httpOnly: false, // Allow frontend access
          secure: true, // HTTPS only
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          domain: '.loveaihub.com'
        });

        // Also set refresh token if available
        if (refresh_token) {
          res.cookie('supabase-refresh-token', refresh_token.toString(), {
            httpOnly: true, // More secure for refresh tokens
            secure: true,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            domain: '.loveaihub.com'
          });
        }

        return res.redirect("https://www.loveaihub.com/");
      } catch (tokenError) {
        console.error('Error processing token:', tokenError);
        return res.redirect("https://www.loveaihub.com/?error=token_processing_failed");
      }
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
          return res.redirect("https://www.loveaihub.com/");
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
      
      // Handle potential hash fragment tokens (client-side implicit flow)
      // Since server cannot access hash fragments, return a page that processes them client-side
      console.error('No query parameters received, checking for hash fragments');
      
      return res.send(`
        <html>
          <head>
            <title>Processing OAuth...</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background: #f5f5f5; 
                text-align: center; 
              }
              .container { 
                background: white; 
                padding: 40px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                max-width: 600px;
                margin: 0 auto;
              }
              .loading { 
                color: #1976d2; 
                font-size: 18px; 
                margin: 20px 0; 
              }
              .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #1976d2;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔄 Processing Authentication...</h1>
              <div class="spinner"></div>
              <div class="loading">Checking for OAuth tokens...</div>
              <div id="status">Analyzing authentication data...</div>
            </div>
            
            <script>
              console.log('OAuth callback processor loaded');
              console.log('Current URL:', window.location.href);
              console.log('Hash fragment:', window.location.hash);
              console.log('Search params:', window.location.search);
              
              // Check for tokens in hash fragment (Supabase implicit flow)
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash);
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');
              const error = params.get('error');
              const error_description = params.get('error_description');
              
              console.log('Extracted from hash:', {
                access_token: !!access_token,
                refresh_token: !!refresh_token,
                error: error,
                error_description: error_description
              });
              
              if (error) {
                document.getElementById('status').innerHTML = 'Authentication failed: ' + error;
                setTimeout(() => {
                  window.location.href = 'https://www.loveaihub.com/?error=' + encodeURIComponent(error);
                }, 2000);
              } else if (access_token) {
                document.getElementById('status').innerHTML = 'Authentication successful! Redirecting...';
                
                // Send tokens to server for processing
                fetch('/api/auth/process-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                  })
                }).then(response => {
                  if (response.ok) {
                    window.location.href = 'https://www.loveaihub.com/';
                  } else {
                    window.location.href = 'https://www.loveaihub.com/?error=token_processing_failed';
                  }
                }).catch(err => {
                  console.error('Token processing error:', err);
                  window.location.href = 'https://www.loveaihub.com/?error=network_error';
                });
              } else {
                document.getElementById('status').innerHTML = 'No authentication data found';
                setTimeout(() => {
                  window.location.href = 'https://www.loveaihub.com/?error=missing_auth_data';
                }, 3000);
              }
            </script>
          </body>
        </html>
      `);
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
      res.redirect("https://www.loveaihub.com/");
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