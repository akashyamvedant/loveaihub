import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Video, 
  Play, 
  Download, 
  Clock, 
  Loader2,
  Copy,
  ExternalLink,
  Film
} from "lucide-react";

const videoModels = [
  { id: "provider-6/wan-2.1", name: "WAN-2.1", provider: "Provider 6", description: "High-quality video generation" },
];

const aspectRatios = [
  { id: "16:9", name: "16:9 (Landscape)" },
  { id: "9:16", name: "9:16 (Portrait)" },
  { id: "1:1", name: "1:1 (Square)" },
  { id: "4:3", name: "4:3 (Standard)" },
];

const durations = [
  { id: "3", name: "3 seconds" },
  { id: "5", name: "5 seconds" },
  { id: "10", name: "10 seconds" },
  { id: "15", name: "15 seconds" },
];

export default function VideoGeneration() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(videoModels[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("5");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const generateVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/generate/video", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video Generation Started",
        description: "Your video is being generated. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Generation Failed",
        description: error.message || "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: generations, isLoading: generationsLoading } = useQuery({
    queryKey: ["/api/generations"],
    enabled: isAuthenticated,
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate a video.",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscriptionType === "free" && user?.generationsUsed >= user?.generationsLimit) {
      toast({
        title: "Generation Limit Reached",
        description: "You've reached your free tier limit. Please upgrade to premium for unlimited generations.",
        variant: "destructive",
      });
      return;
    }

    generateVideoMutation.mutate({
      model: selectedModel,
      prompt,
      duration: parseInt(selectedDuration),
      aspect_ratio: selectedAspectRatio,
    });
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard.",
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const videoGenerations = generations?.filter((g: any) => g.type === "video") || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Video Generation Lab</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform text prompts into professional videos with AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Film className="w-6 h-6" />
                    <span>Generate Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Video Description</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the video you want to generate... Be specific about actions, scenes, and style."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] bg-slate-800/50 border-slate-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Include details about camera movements, lighting, and specific actions for better results.
                    </p>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {videoModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Video Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.id} value={duration.id}>
                              {duration.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aspect">Aspect Ratio</Label>
                      <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aspectRatios.map((ratio) => (
                            <SelectItem key={ratio.id} value={ratio.id}>
                              {ratio.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={generateVideoMutation.isPending || !prompt.trim()}
                    className="btn-primary w-full"
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

                  {/* Note about video generation time */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-400">Video Generation Time</p>
                        <p className="text-xs text-blue-300">
                          Video generation typically takes 2-5 minutes depending on duration and complexity. 
                          You'll receive a notification when your video is ready.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Indicator */}
                  {user?.subscriptionType === "free" && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Free Plan Usage</span>
                        <span className="text-sm font-medium">
                          {user.generationsUsed} / {user.generationsLimit}
                        </span>
                      </div>
                      <Progress value={(user.generationsUsed / user.generationsLimit) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Generations */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-6 h-6" />
                    <span>Recent Videos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="loading-shimmer h-32 rounded-lg"></div>
                      ))}
                    </div>
                  ) : videoGenerations.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No videos generated yet</p>
                      <p className="text-sm text-muted-foreground">Your generated videos will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videoGenerations.slice(0, 5).map((generation: any) => (
                        <div key={generation.id} className="glass-effect rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              {generation.result?.data?.[0]?.url ? (
                                <video
                                  className="w-full h-full object-cover rounded-lg"
                                  poster="/placeholder-video.jpg"
                                >
                                  <source src={generation.result.data[0].url} type="video/mp4" />
                                </video>
                              ) : (
                                <Video className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {generation.model.split('/')[1] || generation.model}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {generation.prompt}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  generation.status === "completed" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : generation.status === "failed"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                  {generation.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyPrompt(generation.prompt)}
                                  className="h-6 px-2"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                {generation.result?.data?.[0]?.url && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(generation.result.data[0].url, '_blank')}
                                    className="h-6 px-2"
                                  >
                                    <Play className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
