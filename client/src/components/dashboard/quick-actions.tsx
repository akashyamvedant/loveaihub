import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit, 
  ArrowRight,
  Sparkles,
  Zap,
  Wand2
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Image Generation Studio",
      description: "Create stunning images with 20+ AI models including FLUX, DALL-E, and Imagen",
      icon: Image,
      href: "/image-generation",
      gradient: "from-blue-500 to-purple-600",
      features: ["FLUX Pro", "DALL-E 3", "Imagen 3"],
      badge: "Most Popular"
    },
    {
      title: "Video Generation Lab",
      description: "Transform text into professional videos with cutting-edge AI technology",
      icon: Video,
      href: "/video-generation",
      gradient: "from-purple-500 to-pink-600",
      features: ["WAN-2.1", "HD Quality", "Custom Duration"],
      badge: "New"
    },
    {
      title: "Advanced AI Chat",
      description: "Chat with the most advanced AI models including GPT-4, Claude, and Gemini",
      icon: MessageSquare,
      href: "/ai-chat",
      gradient: "from-green-500 to-teal-600",
      features: ["GPT-4", "Claude 3.5", "Gemini Pro"],
      badge: "Updated"
    },
    {
      title: "Audio Generation",
      description: "Generate high-quality speech and audio with advanced AI voice synthesis",
      icon: Mic,
      href: "/audio-speech",
      gradient: "from-orange-500 to-red-600",
      features: ["Natural Voices", "Multiple Languages", "Custom Tones"]
    },
    {
      title: "Image Editor Pro",
      description: "Edit and enhance images with AI-powered tools and advanced filters",
      icon: Edit,
      href: "/image-editing",
      gradient: "from-cyan-500 to-blue-600",
      features: ["AI Inpainting", "Style Transfer", "Background Removal"]
    },
    {
      title: "Quick Generate",
      description: "Instantly create content with our smart quick-generation tools",
      icon: Zap,
      href: "/image-generation?quick=true",
      gradient: "from-yellow-500 to-orange-600",
      features: ["One-Click", "Smart Prompts", "Fast Results"],
      badge: "Beta"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>Quick Actions</span>
          </h2>
          <p className="text-muted-foreground text-sm">Jump into your favorite AI tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="group glass-card hover:scale-105 transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
                
                {action.features && (
                  <div className="flex flex-wrap gap-1">
                    {action.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link href={action.href}>
                  <Button className="w-full group/btn">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}