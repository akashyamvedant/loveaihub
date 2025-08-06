import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Zap,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Mic,
  Edit,
  Plus,
  Settings,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function FavoritesShortcuts() {
  const [favorites, setFavorites] = useState<string[]>(["image-generation", "ai-chat"]);

  const aiTools = [
    {
      id: "image-generation",
      name: "Image Generation",
      description: "Create stunning AI images",
      icon: ImageIcon,
      color: "bg-purple-500",
      path: "/image-generation",
      category: "Creative",
      featured: true
    },
    {
      id: "video-generation",
      name: "Video Creation",
      description: "Generate AI-powered videos",
      icon: Video,
      color: "bg-red-500",
      path: "/video-generation",
      category: "Creative",
      featured: true
    },
    {
      id: "ai-chat",
      name: "AI Chat",
      description: "Chat with advanced AI models",
      icon: MessageSquare,
      color: "bg-green-500",
      path: "/ai-chat",
      category: "Productivity",
      featured: true
    },
    {
      id: "audio-speech",
      name: "Audio & Speech",
      description: "Generate and transcribe audio",
      icon: Mic,
      color: "bg-blue-500",
      path: "/audio-speech",
      category: "Audio",
      featured: false
    },
    {
      id: "image-editing",
      name: "Image Editing",
      description: "Edit images with AI",
      icon: Edit,
      color: "bg-orange-500",
      path: "/image-editing",
      category: "Creative",
      featured: false
    }
  ];

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const favoriteTools = aiTools.filter(tool => favorites.includes(tool.id));
  const featuredTools = aiTools.filter(tool => tool.featured && !favorites.includes(tool.id));

  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      {favoriteTools.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Favorites
              </CardTitle>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Quick access to your most used AI tools
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={tool.path}>
                    <div className="group relative p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(tool.id);
                          }}
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </Button>
                      </div>
                      <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {tool.category}
                        </Badge>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Tools */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Featured Tools
            </CardTitle>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover powerful AI tools for your creative projects
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.path}>
                  <div className="group relative p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                      >
                        <Star className="w-4 h-4 text-muted-foreground hover:text-yellow-500" />
                      </Button>
                    </div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
            {aiTools.filter(tool => !tool.featured).map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.path}>
                  <div className="group relative p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                      >
                        <Star className={`w-4 h-4 ${favorites.includes(tool.id) ? 'text-yellow-500 fill-current' : 'text-muted-foreground hover:text-yellow-500'}`} />
                      </Button>
                    </div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}