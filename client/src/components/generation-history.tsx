import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  History,
  Search,
  Filter,
  Download,
  Share,
  Heart,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Mic,
  Edit,
  Calendar,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGenerationHistory } from "@/hooks/useDashboardData";

export default function GenerationHistory() {
  const { data: generations, isLoading } = useGenerationHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'chat': return MessageSquare;
      case 'audio': return Mic;
      case 'transcription': return Mic;
      case 'image_edit': return Edit;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-gradient-to-br from-purple-500 to-pink-500';
      case 'video': return 'bg-gradient-to-br from-red-500 to-orange-500';
      case 'chat': return 'bg-gradient-to-br from-green-500 to-teal-500';
      case 'audio': return 'bg-gradient-to-br from-blue-500 to-cyan-500';
      case 'transcription': return 'bg-gradient-to-br from-indigo-500 to-purple-500';
      case 'image_edit': return 'bg-gradient-to-br from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityTitle = (activity: any) => {
    const typeMap = {
      'image': 'Image Generation',
      'video': 'Video Creation',
      'chat': 'AI Chat Session',
      'audio': 'Audio Generation',
      'transcription': 'Audio Transcription',
      'image_edit': 'Image Editing'
    };
    return typeMap[activity.type as keyof typeof typeMap] || 'AI Generation';
  };

  const filteredGenerations = generations?.filter(generation => {
    const matchesSearch = !searchQuery || 
      generation.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      generation.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || generation.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const handleToggleLike = (id: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
      } else {
        newLiked.add(id);
      }
      return newLiked;
    });
  };

  const generationTypes = [...new Set(generations?.map(g => g.type) || [])];

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-10 bg-muted rounded flex-1 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Generation History
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              View and manage all your AI generations
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search generations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            {generationTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filteredGenerations.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery || filterType !== "all" ? "No matching generations found" : "No generations yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start creating with our AI tools to see your history here"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredGenerations.map((generation) => {
              const Icon = getActivityIcon(generation.type);
              const isLiked = likedItems.has(generation.id);
              return (
                <div
                  key={generation.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors group"
                >
                  <Avatar className={`w-12 h-12 ${getActivityColor(generation.type)} flex items-center justify-center`}>
                    <AvatarFallback className={`${getActivityColor(generation.type)} border-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {getActivityTitle(generation)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {generation.prompt.length > 80
                            ? `${generation.prompt.substring(0, 80)}...`
                            : generation.prompt
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                          onClick={() => handleToggleLike(generation.id)}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <Badge variant="outline" className="text-xs">
                        {generation.model}
                      </Badge>
                      <span className={`font-medium ${getStatusColor(generation.status)}`}>
                        {generation.status}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}