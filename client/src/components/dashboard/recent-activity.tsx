import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  Image as ImageIcon, 
  Video, 
  MessageSquare, 
  Mic,
  Download,
  Share,
  Heart,
  MoreHorizontal,
  TrendingUp,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'image' | 'video' | 'chat' | 'audio';
  title: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'processing' | 'failed';
  model: string;
  liked?: boolean;
}

// Mock data - replace with real API call
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'image',
    title: 'Cyberpunk City Landscape',
    description: 'Generated using FLUX Pro model with enhanced prompts',
    timestamp: new Date(Date.now() - 30000), // 30 seconds ago
    status: 'completed',
    model: 'FLUX Pro',
    liked: true
  },
  {
    id: '2',
    type: 'video',
    title: 'Ocean Waves Animation',
    description: 'Created 30-second cinematic video',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    status: 'processing',
    model: 'WAN-2.1'
  },
  {
    id: '3',
    type: 'chat',
    title: 'Code Review Session',
    description: 'Discussed React optimization with GPT-4',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    status: 'completed',
    model: 'GPT-4'
  },
  {
    id: '4',
    type: 'image',
    title: 'Abstract Art Piece',
    description: 'Artistic creation with DALL-E 3',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    status: 'completed',
    model: 'DALL-E 3'
  },
  {
    id: '5',
    type: 'audio',
    title: 'Podcast Introduction',
    description: 'Generated professional voice narration',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: 'completed',
    model: 'ElevenLabs'
  }
];

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);
  const [isLoading, setIsLoading] = useState(false);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'chat': return MessageSquare;
      case 'audio': return Mic;
      default: return Clock;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'image': return 'bg-blue-500';
      case 'video': return 'bg-purple-500';
      case 'chat': return 'bg-green-500';
      case 'audio': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleToggleLike = (id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, liked: !activity.liked }
          : activity
      )
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <CardTitle>Recent Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">Live</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/20 transition-colors group"
                >
                  <Avatar className={`w-10 h-10 ${getActivityColor(activity.type)} flex items-center justify-center`}>
                    <AvatarFallback className={`${getActivityColor(activity.type)} border-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.model}
                          </Badge>
                          <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${activity.liked ? 'text-red-500' : 'text-muted-foreground'}`}
                          onClick={() => handleToggleLike(activity.id)}
                        >
                          <Heart className={`w-3 h-3 ${activity.liked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                          <Share className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex items-center justify-center pt-2 border-t border-border/20">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Load More Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}