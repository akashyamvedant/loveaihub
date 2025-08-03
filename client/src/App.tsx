import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/image-generation" component={ImageGeneration} />
          <Route path="/video-generation" component={VideoGeneration} />
          <Route path="/ai-chat" component={AiChat} />
          <Route path="/audio-speech" component={AudioSpeech} />
          <Route path="/image-editing" component={ImageEditing} />
          <Route path="/api-docs" component={ApiDocs} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route path="/blog" component={Blog} />
      <Route path="/pricing" component={Pricing} />
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
