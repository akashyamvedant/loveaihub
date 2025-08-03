import { createClient } from '@supabase/supabase-js';

// These will be provided by the user as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth API helpers that communicate with our backend
export const authApi = {
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    return response.json();
  },

  async signIn(email: string, password: string) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }

    return response.json();
  },

  async signOut() {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign out failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch('/api/auth/user');
    
    if (!response.ok) {
      if (response.status === 401) {
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
        // Try to parse as JSON, fallback to text if it fails
        let errorMessage = 'Google sign in failed';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          const textError = await response.text();
          console.error('Non-JSON error response:', textError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const textResponse = await response.text();
        console.error('Failed to parse JSON response:', textResponse);
        throw new Error('Invalid server response format');
      }
      
      // Redirect to Google OAuth URL
      if (data.url) {
        window.location.href = data.url;
      }
      
      return data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  },
};