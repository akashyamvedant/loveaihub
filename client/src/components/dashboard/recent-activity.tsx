import { useState } from "react";
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
  Calendar,
  Edit
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRecentActivity } from "@/hooks/useDashboardData";

export default function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity(10);
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

  const getActivityDescription = (activity: any) => {
    if (activity.prompt) {
      return activity.prompt.length > 50 
        ? `${activity.prompt.substring(0, 50)}...` 
        : activity.prompt;
    }
    return `Using ${activity.model} model`;
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

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your latest AI generations and activities
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          View All
        </Button>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
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
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const isLiked = likedItems.has(activity.id);
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
                          {getActivityTitle(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getActivityDescription(activity)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.model}
                          </Badge>
                          <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                          onClick={() => handleToggleLike(activity.id)}
                        >
                          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
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
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No recent activity</p>
            <p className="text-sm text-muted-foreground">
              Start creating with AI tools to see your activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}