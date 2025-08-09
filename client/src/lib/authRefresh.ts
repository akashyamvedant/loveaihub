import { authStorage } from './authStorage';
import { queryClient } from './queryClient';

export const authRefresh = {
  // Force refresh authentication
  async forceRefresh(): Promise<boolean> {
    try {
      console.log('Forcing auth refresh...');
      
      // Clear existing queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Clear stored token to force fresh authentication
      authStorage.removeToken();
      
      // Try to refetch user data
      const result = await queryClient.fetchQuery({
        queryKey: ["/api/auth/user"],
        staleTime: 0,
      });
      
      return !!result?.user;
    } catch (error) {
      console.error('Force refresh failed:', error);
      return false;
    }
  },

  // Check if user needs to re-authenticate
  needsReauth(): boolean {
    const token = authStorage.getToken();
    return !token;
  },

  // Clear all auth data and redirect to login
  async forceReauth(): Promise<void> {
    console.log('Forcing re-authentication...');
    
    // Clear all stored auth data
    authStorage.removeToken();
    queryClient.clear();
    
    // Redirect to login
    window.location.href = '/';
  }
};
