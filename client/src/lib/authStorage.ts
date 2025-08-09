// Auth storage utilities for managing authentication tokens

export const authStorage = {
  // Get token from localStorage or cookies
  getToken(): string | null {
    // First check localStorage (for manual login)
    const localToken = localStorage.getItem('supabase-auth-token');
    if (localToken) {
      return localToken;
    }

    // Then check cookies (for OAuth login)
    const cookieToken = getCookie('supabase-auth-token');
    if (cookieToken) {
      // Store in localStorage for consistency
      localStorage.setItem('supabase-auth-token', cookieToken);
      return cookieToken;
    }

    return null;
  },

  setToken(token: string): void {
    localStorage.setItem('supabase-auth-token', token);
  },

  removeToken(): void {
    localStorage.removeItem('supabase-auth-token');
    // Also remove cookie
    document.cookie = 'supabase-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.loveaihub.com';
  },

  // Check if we have any form of authentication
  hasAuth(): boolean {
    return !!this.getToken();
  }
};

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}