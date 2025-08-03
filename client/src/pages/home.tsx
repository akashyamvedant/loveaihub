import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GenerationHistory from "@/components/generation-history";
import SubscriptionManager from "@/components/subscription-manager";
import { 
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit, 
  Code,
  TrendingUp,
  Clock,
  Zap,
  Crown
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const usagePercentage = user.subscriptionType === "free" 
    ? (user.generationsUsed / user.generationsLimit) * 100 
    : 0;

  const services = [
    {
      title: "Image Generation Studio",
      description: "Create stunning images with 20+ AI models",
      icon: Image,
      href: "/image-generation",
      gradient: "from-primary to-purple-500",
      stats: "FLUX, DALL-E, Imagen"
    },
    {
      title: "Video Generation Lab",
      description: "Transform text into professional videos",
      icon: Video,
      href: "/video-generation",
      gradient: "from-cyan-500 to-primary",
      stats: "WAN-2.1 Model"
    },
    {
      title: "Advanced AI Chat",
      description: "Chat with the most advanced AI models",
      icon: MessageSquare,
      href: "/ai-chat",
      gradient: "from-purple-500 to-cyan-500",
      stats: "GPT-4, Claude, Gemini"
    },
    {
      title: "Audio & Speech",
      description: "Generate speech and transcribe audio",
      icon: Mic,
      href: "/audio-speech",
      gradient: "from-emerald-500 to-primary",
      stats: "TTS, Whisper, Sonic"
    },
    {
      title: "Image Editing Suite",
      description: "Professional AI-powered image editing",
      icon: Edit,
      href: "/image-editing",
      gradient: "from-orange-500 to-primary",
      stats: "Inpainting, Style Transfer"
    },
    {
      title: "API & Embeddings",
      description: "Integrate AI into your applications",
      icon: Code,
      href: "/api-docs",
      gradient: "from-pink-500 to-primary",
      stats: "REST API, SDKs"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, <span className="gradient-text">{user.firstName || "Creator"}</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Ready to create something amazing with AI?
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                {user.subscriptionType === "premium" ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Premium</span>
                  </div>
                ) : (
                  <Link href="/pricing">
                    <Button className="btn-primary">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            {user.subscriptionType === "free" && (
              <Card className="glass-effect border-border mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Free Plan Usage</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.generationsUsed} of {user.generationsLimit} generations used
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{user.generationsLimit - user.generationsUsed}</div>
                      <div className="text-sm text-muted-foreground">remaining</div>
                    </div>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  {usagePercentage > 80 && (
                    <div className="mt-2 text-sm text-orange-400">
                      You're running low on generations. Consider upgrading to premium for unlimited access.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user.generationsUsed}</div>
                    <div className="text-sm text-muted-foreground">Total Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">20+</div>
                    <div className="text-sm text-muted-foreground">AI Models</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold capitalize">{user.subscriptionType}</div>
                    <div className="text-sm text-muted-foreground">Plan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Services Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">AI Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link key={service.title} href={service.href}>
                  <Card className="glass-effect border-border card-hover group h-full">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="text-sm text-primary font-medium">{service.stats}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation History */}
            <div className="lg:col-span-2">
              <GenerationHistory />
            </div>

            {/* Subscription Manager */}
            <div className="lg:col-span-1">
              <SubscriptionManager />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
