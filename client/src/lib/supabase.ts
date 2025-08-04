import { createClient } from '@supabase/supabase-js';
import { authStorage } from './authStorage';

// These will be provided by the user as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth API helpers that communicate with our backend
export const authApi = {
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear stored token regardless of response
    authStorage.removeToken();

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign out failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const token = authStorage.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if we have a token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/auth/user', {
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
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