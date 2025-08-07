import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthBanner } from "@/components/AuthBanner";
import { 
  Sparkles, 
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit, 
  Code,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Shield
} from "lucide-react";

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signup");
  const [showAuthBanner, setShowAuthBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for OAuth fallback parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'fallback' || urlParams.get('fallback') === 'email') {
      setShowAuthBanner(true);
      setAuthModalTab("signup");
    }
    
    // Check if user is already authenticated and redirect to dashboard
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('supabase-auth-token='))
      ?.split('=')[1];
    
    if (authToken && urlParams.get('auth') === 'success') {
      // Redirect authenticated users to dashboard
      window.location.href = '/home';
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-purple-900/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: "-2s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: "-4s" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Auth Banner for OAuth Fallback */}
          {showAuthBanner && (
            <AuthBanner
              onClose={() => setShowAuthBanner(false)}
              onOpenAuth={() => {
                setShowAuthModal(true);
                setAuthModalTab("signup");
              }}
            />
          )}
          
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                🚀 20+ AI Models Available
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Professional
              <span className="gradient-text block">AI Platform</span>
              <span className="text-4xl md:text-5xl">for Creators</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate stunning images, create videos, chat with advanced AI, transcribe audio, and more. 
              Access 20+ state-of-the-art AI models through our unified platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                className="btn-primary text-lg px-8 py-4 animate-glow"
                onClick={() => {
                  setAuthModalTab("signup");
                  setShowAuthModal(true);
                }}
              >
                Start Creating Free
              </Button>
              <Link href="/api-docs">
                <Button variant="outline" className="btn-secondary text-lg px-8 py-4">
                  View Documentation
                </Button>
              </Link>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>50 Free Generations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Instant Setup</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="glass-effect rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-effect rounded-xl p-6 card-hover">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                    <Image className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Image Generation</h3>
                  <p className="text-sm text-muted-foreground">FLUX, DALL-E, Stable Diffusion</p>
                </div>
                
                <div className="glass-effect rounded-xl p-6 card-hover">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-primary rounded-lg mb-4 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Video Creation</h3>
                  <p className="text-sm text-muted-foreground">WAN-2.1 Video Model</p>
                </div>
                
                <div className="glass-effect rounded-xl p-6 card-hover">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg mb-4 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Chat</h3>
                  <p className="text-sm text-muted-foreground">GPT-4, Claude, Gemini</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Powerful AI Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, generate, and analyze with AI in one professional platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Image Generation Studio */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Image className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Image Generation Studio</h3>
                <p className="text-muted-foreground mb-6">Create stunning images with 20+ models including FLUX, DALL-E 3, Stable Diffusion, and Imagen. Professional quality with advanced controls.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">FLUX-1-Pro</span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">DALL-E 3</span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Imagen 4</span>
                </div>
                <Link href="/image-generation" className="text-primary hover:text-primary/80 font-medium inline-flex items-center">
                  Explore Models
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>

            {/* Video Generation Lab */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-primary rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Video Generation Lab</h3>
                <p className="text-muted-foreground mb-6">Transform text prompts into professional videos using WAN-2.1. Create engaging content for social media, marketing, and entertainment.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">WAN-2.1</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">HD Quality</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Fast Render</span>
                </div>
                <Link href="/video-generation" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>

            {/* Advanced AI Chat */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Advanced AI Chat</h3>
                <p className="text-muted-foreground mb-6">Chat with the most advanced AI models. Web search, analysis tools, research capabilities, and creative assistance in one interface.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">GPT-4.1</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Claude 4</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Web Search</span>
                </div>
                <Link href="/ai-chat" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center">
                  Start Chatting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>

            {/* Audio & Speech */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-primary rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Audio & Speech</h3>
                <p className="text-muted-foreground mb-6">Generate high-quality speech from text and transcribe audio with multiple TTS and transcription models including Whisper and Sonic.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">TTS-HD</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Whisper</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Sonic-2</span>
                </div>
                <Link href="/audio-speech" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center">
                  Try Audio Tools
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>

            {/* Image Editing Suite */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-primary rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Edit className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Image Editing Suite</h3>
                <p className="text-muted-foreground mb-6">Professional image editing with AI-powered tools. Inpainting, outpainting, style transfer, and advanced editing capabilities.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">FLUX-Kontext</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">Inpainting</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">Style Transfer</span>
                </div>
                <Link href="/image-editing" className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center">
                  Edit Images
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>

            {/* API & Embeddings */}
            <Card className="glass-effect border-border card-hover group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-primary rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">API & Embeddings</h3>
                <p className="text-muted-foreground mb-6">Integrate AI into your applications with our developer-friendly API. Advanced embeddings for semantic search and analysis.</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">REST API</span>
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">Embeddings</span>
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">SDKs</span>
                </div>
                <Link href="/api-docs" className="text-pink-400 hover:text-pink-300 font-medium inline-flex items-center">
                  View API Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Models Showcase */}
      <section id="models" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">20+ AI Models</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access the latest and most powerful AI models from leading providers, all through our unified API
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Image Models */}
            <Card className="glass-effect border-border card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-lg"></div>
                  <h3 className="font-semibold">Image Generation</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">FLUX-1-Pro</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">DALL-E 3</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Imagen 4</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Stable Diffusion</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">+5 more models</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Models */}
            <Card className="glass-effect border-border card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
                  <h3 className="font-semibold">Chat Completion</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">GPT-4.1</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Claude 4</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gemini 2.5 Pro</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Llama 4</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">+15 more models</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Models */}
            <Card className="glass-effect border-border card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg"></div>
                  <h3 className="font-semibold">Video Generation</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">WAN-2.1</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">HD Quality</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Premium</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fast Rendering</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Custom Styles</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Models */}
            <Card className="glass-effect border-border card-hover">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-lg"></div>
                  <h3 className="font-semibold">Audio & Speech</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">TTS-HD</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Whisper V3</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sonic-2</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multi-language</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/api-docs">
              <Button className="btn-primary px-8 py-4">
                View All Models & Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats & Trust Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">20+</div>
              <p className="text-muted-foreground">AI Models</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
              <p className="text-muted-foreground">Generations Created</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">1K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-effect rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Create with
                <span className="gradient-text block">Professional AI?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators using LoveAIHub to generate stunning content with the world's most advanced AI models.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="btn-primary text-lg px-8 py-4"
                  onClick={() => {
                    setAuthModalTab("signup");
                    setShowAuthModal(true);
                  }}
                >
                  Start Creating Free
                </Button>
                <Link href="/pricing">
                  <Button variant="outline" className="btn-secondary text-lg px-8 py-4">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex justify-center items-center space-x-8 text-sm text-muted-foreground">
                <span>✨ 50 free generations</span>
                <span>🚀 Instant access</span>
                <span>💳 No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
