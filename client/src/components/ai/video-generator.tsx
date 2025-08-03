import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Play, 
  Download, 
  Loader2,
  Clock,
  Film
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface VideoGeneratorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: Array<{
    id: string;
    name: string;
    provider: string;
    category: string;
    description: string;
    badge: string;
    badgeColor: string;
    maxDuration: string;
    resolution: string;
  }>;
}

export default function VideoGenerator({ selectedModel, onModelChange, models }: VideoGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);

  const generateVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/video/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedVideos(prev => [data, ...prev]);
      toast({
        title: "Video generation started!",
        description: "Your video is being processed. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your video",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscriptionTier === 'free' && user.generationsUsed >= user.generationsLimit) {
      toast({
        title: "Generation limit reached",
        description: "Upgrade to Premium for unlimited generations",
        variant: "destructive",
      });
      return;
    }

    generateVideoMutation.mutate({
      model: selectedModel,
      prompt: prompt.trim(),
    });
  };

  const downloadVideo = (videoUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Generate Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Video Model</Label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <Badge className={`ml-2 ${model.badgeColor}`}>
                        {model.badge}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Model Info */}
            {currentModel && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p><strong>Resolution:</strong> {currentModel.resolution}</p>
                <p><strong>Max Duration:</strong> {currentModel.maxDuration}</p>
                <p className="text-muted-foreground">{currentModel.description}</p>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Video Description</Label>
            <Textarea
              placeholder="Describe the video you want to create. Include details about motion, scene, lighting, and style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              💡 Tip: Describe movement and actions clearly. For example: "A golden retriever running through a sunlit meadow, slow motion, cinematic lighting"
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generateVideoMutation.isPending || !prompt.trim()}
            className="w-full btn-depth"
            size="lg"
          >
            {generateVideoMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Film className="w-5 h-5 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {/* Processing Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Video generation typically takes 2-5 minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Generated Videos */}
      {generatedVideos.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Generated Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedVideos.map((videoData, index) => (
                <div key={index} className="space-y-4">
                  <div className="relative group">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {videoData.result?.url ? (
                        <video
                          controls
                          className="w-full h-full object-cover"
                          poster={videoData.result?.thumbnail}
                        >
                          <source src={videoData.result.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            {generateVideoMutation.isPending ? (
                              <>
                                <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Processing video...</p>
                              </>
                            ) : (
                              <>
                                <Video className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Video will appear here</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Actions */}
                    {videoData.result?.url && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadVideo(videoData.result.url, `generated-video-${Date.now()}.mp4`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Prompt:</p>
                    <p className="text-sm text-muted-foreground">
                      {videoData.prompt || prompt}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Model: {selectedModel.split('/')[1]}</span>
                      <span>Status: {videoData.status || 'Processing'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {generatedVideos.length === 0 && (
        <Card className="glass-effect">
          <CardContent className="py-12 text-center">
            <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Create Videos</h3>
            <p className="text-muted-foreground mb-4">
              Enter a detailed description above and generate your first AI video
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Describe movement and actions clearly</p>
              <p>• Include lighting and scene details</p>
              <p>• Specify camera angles if needed</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
