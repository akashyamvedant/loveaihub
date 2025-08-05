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
import Home from "@/pages/home";
import ImageGeneration from "@/pages/image-generation";
import VideoGeneration from "@/pages/video-generation";
import AiChat from "@/pages/ai-chat";
import AudioSpeech from "@/pages/audio-speech";
import ImageEditing from "@/pages/image-editing";
import ApiDocs from "@/pages/api-docs";
import Blog from "@/pages/blog";
import Admin from "@/pages/admin";
import Pricing from "@/pages/pricing";
import ResetPassword from "@/pages/reset-password";

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

  // Show authenticated routes only if both conditions are true
  // After logout, both should be false
  const hasAuth = authStorage.hasAuth() && (isAuthenticated || isLoading);
  
  // Force auth refresh when landing on /home after OAuth
  useEffect(() => {
    if (window.location.pathname === '/home' && authStorage.hasAuth() && !isAuthenticated && !isLoading) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [isAuthenticated, isLoading]);
  
  return (
    <Switch>
      {isLoading ? (
        <Route path="*">
          {() => (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
            </div>
          )}
        </Route>
      ) : hasAuth ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/image-generation" component={ImageGeneration} />
          <Route path="/video-generation" component={VideoGeneration} />
          <Route path="/ai-chat" component={AiChat} />
          <Route path="/audio-speech" component={AudioSpeech} />
          <Route path="/image-editing" component={ImageEditing} />
          <Route path="/api-docs" component={ApiDocs} />
          <Route path="/admin" component={Admin} />
          <Route path="/blog" component={Blog} />
          <Route path="/pricing" component={Pricing} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/blog" component={Blog} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/reset-password" component={ResetPassword} />
        </>
      )}
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
