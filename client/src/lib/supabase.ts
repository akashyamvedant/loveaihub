import { createClient } from '@supabase/supabase-js';
import { authStorage } from './authStorage';

// These will be provided by the user as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfrpidhedgqixkgafumc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcnBpZGhlZGdxaXhrZ2FmdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODM0NjgsImV4cCI6MjA2OTE1OTQ2OH0.JaYdiISBG8vqfen_qzkOVgYRBq4V2v5CzvxjhBBsM9c';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Please check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth API helpers that communicate with our backend
export const authApi = {
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const responseClone = response.clone();

      if (!response.ok) {
        let errorMessage = 'Sign up failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          try {
            const textError = await responseClone.text();
            console.error('Non-JSON error response:', textError);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          } catch (textError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store the session token for future requests
      if (data.session?.access_token) {
        authStorage.setToken(data.session.access_token);
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseClone = response.clone();

      if (!response.ok) {
        let errorMessage = 'Sign in failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          try {
            const textError = await responseClone.text();
            console.error('Non-JSON error response:', textError);
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          } catch (textError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store the session token for future requests
      if (data.session?.access_token) {
        authStorage.setToken(data.session.access_token);
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include', // Include cookies in request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear any stored tokens
    authStorage.removeToken();

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign out failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include', // Include cookies in request
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear any stored tokens
        authStorage.removeToken();
        return null; // User not authenticated
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user');
    }

    return response.json();
  },

  async resetPassword(email: string) {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return response.json();
  },

  async updatePassword(password: string) {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password update failed');
    }

    return response.json();
  },

  async signInWithGoogle() {
    try {
      console.log('Starting Google OAuth request...');
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUrl: window.location.origin
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Google OAuth setup failed');
      }

      const { url } = await response.json();
      console.log('Redirecting to Google OAuth URL:', url);
      
      // Direct redirect to Google OAuth
      window.location.href = url;
      
      return { success: true };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },
};