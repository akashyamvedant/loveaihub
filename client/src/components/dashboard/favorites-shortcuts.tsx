import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  Plus, 
  Star, 
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  Heart,
  Zap,
  Sparkles
} from "lucide-react";

interface Shortcut {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  gradient: string;
  usageCount: number;
  lastUsed: Date;
  isFavorite: boolean;
  category: 'image' | 'video' | 'chat' | 'audio' | 'editing';
}

// Mock shortcuts data
const mockShortcuts: Shortcut[] = [
  {
    id: '1',
    title: 'Portrait Generator',
    description: 'Quick professional portraits with FLUX Pro',
    url: '/image-generation?preset=portrait',
    icon: '🎨',
    gradient: 'from-blue-500 to-purple-600',
    usageCount: 23,
    lastUsed: new Date(Date.now() - 86400000),
    isFavorite: true,
    category: 'image'
  },
  {
    id: '2',
    title: 'Product Shot Studio',
    description: 'Professional product photography setup',
    url: '/image-generation?preset=product',
    icon: '📸',
    gradient: 'from-green-500 to-teal-600',
    usageCount: 18,
    lastUsed: new Date(Date.now() - 172800000),
    isFavorite: true,
    category: 'image'
  },
  {
    id: '3',
    title: 'Code Assistant',
    description: 'GPT-4 optimized for programming help',
    url: '/ai-chat?preset=coding',
    icon: '💻',
    gradient: 'from-purple-500 to-pink-600',
    usageCount: 45,
    lastUsed: new Date(Date.now() - 3600000),
    isFavorite: false,
    category: 'chat'
  },
  {
    id: '4',
    title: 'Logo Maker',
    description: 'Create professional logos instantly',
    url: '/image-generation?preset=logo',
    icon: '🚀',
    gradient: 'from-orange-500 to-red-600',
    usageCount: 12,
    lastUsed: new Date(Date.now() - 259200000),
    isFavorite: true,
    category: 'image'
  },
  {
    id: '5',
    title: 'Social Media Videos',
    description: 'Quick vertical videos for social media',
    url: '/video-generation?preset=social',
    icon: '📱',
    gradient: 'from-cyan-500 to-blue-600',
    usageCount: 8,
    lastUsed: new Date(Date.now() - 604800000),
    isFavorite: false,
    category: 'video'
  }
];

export default function FavoritesShortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(mockShortcuts);
  const [showAll, setShowAll] = useState(false);

  const handleToggleFavorite = (id: string) => {
    setShortcuts(prev => 
      prev.map(shortcut => 
        shortcut.id === id 
          ? { ...shortcut, isFavorite: !shortcut.isFavorite }
          : shortcut
      )
    );
  };

  const handleRemoveShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(shortcut => shortcut.id !== id));
  };

  const favoriteShortcuts = shortcuts.filter(s => s.isFavorite);
  const recentShortcuts = shortcuts
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, 6);

  const displayShortcuts = showAll ? shortcuts : favoriteShortcuts.slice(0, 6);

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <CardTitle>Quick Favorites</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {favoriteShortcuts.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Edit2 className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {favoriteShortcuts.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Star your most used tools for quick access
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShortcuts.slice(0, 6).map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="group relative p-4 rounded-lg border border-border/20 hover:border-border/40 hover:bg-accent/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${shortcut.gradient} flex items-center justify-center text-white text-lg`}>
                      {shortcut.icon}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500"
                        onClick={() => handleToggleFavorite(shortcut.id)}
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => handleRemoveShortcut(shortcut.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                    {shortcut.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {shortcut.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{shortcut.usageCount} uses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatLastUsed(shortcut.lastUsed)}</span>
                    </div>
                  </div>
                  
                  <Link href={shortcut.url}>
                    <Button size="sm" className="w-full text-xs">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Launch Tool
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shortcuts */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <CardTitle>Recently Used</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Last 7 days
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {recentShortcuts.map((shortcut) => (
              <Link key={shortcut.id} href={shortcut.url}>
                <div className="group p-3 rounded-lg border border-border/20 hover:border-border/40 hover:bg-accent/20 transition-all text-center cursor-pointer">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-r ${shortcut.gradient} flex items-center justify-center text-white text-sm`}>
                    {shortcut.icon}
                  </div>
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                    {shortcut.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatLastUsed(shortcut.lastUsed)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 mt-2 ${shortcut.isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleFavorite(shortcut.id);
                    }}
                  >
                    <Heart className={`w-3 h-3 ${shortcut.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Shortcut CTA */}
      <Card className="glass-card border-dashed border-border/40 hover:border-border/60 transition-colors">
        <CardContent className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium mb-2">Create Custom Shortcut</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Build personalized workflows with your favorite settings and prompts
          </p>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Shortcut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}