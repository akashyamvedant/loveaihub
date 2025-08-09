import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { authStorage } from "@/lib/authStorage";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import SimpleHome from "@/pages/simple-home";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check for OAuth success callback
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const authError = urlParams.get('error');

    if (authSuccess === 'success') {
      toast({
        title: "Welcome!",
        description: "You've been successfully signed in.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Force auth refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } else if (authError) {
      toast({
        title: "Authentication Error",
        description: decodeURIComponent(authError),
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Show authenticated routes only if user is authenticated
  // Special case: Always allow reset-password page regardless of auth state
  const isResetPasswordPage = window.location.pathname === '/reset-password';
  const hasAuth = !isResetPasswordPage && isAuthenticated;

  // Debug logging
  console.log('Auth state:', {
    isAuthenticated,
    isLoading,
    hasAuth,
    hasStoredAuth: authStorage.hasAuth(),
    currentPath: window.location.pathname
  });
  
  // Force auth refresh when landing on /home after OAuth
  useEffect(() => {
    if (window.location.pathname === '/home' && authStorage.hasAuth() && !isAuthenticated && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [isAuthenticated, isLoading]);
  
  return (
    <Switch>
      <Route path="/" component={SimpleHome} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
