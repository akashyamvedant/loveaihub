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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Video,
  Play,
  Download,
  Clock,
  Loader2,
  Copy,
  ExternalLink,
  Film,
  Upload,
  Image,
  Sparkles,
  Settings,
  Eye,
  Filter,
  Search,
  Heart,
  Share2,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Wand2,
  Camera,
  Palette,
  Zap,
  ArrowLeft
} from "lucide-react";

const videoModels = [
  { 
    id: "provider-6/wan-2.1", 
    name: "WAN-2.1", 
    provider: "Provider 6", 
    description: "High-quality video generation with realistic motion",
    speed: "Medium",
    quality: "High",
    maxDuration: 15,
    features: ["Realistic motion", "High detail", "Cinematic quality"],
    icon: "🎬"
  },
  { 
    id: "provider-7/luma-dream", 
    name: "Luma Dream", 
    provider: "Luma AI", 
    description: "Photorealistic video generation with smooth transitions",
    speed: "Fast",
    quality: "Ultra High",
    maxDuration: 10,
    features: ["Photorealistic", "Smooth motion", "Professional grade"],
    icon: "✨"
  },
  { 
    id: "provider-8/runway-gen3", 
    name: "Runway Gen3", 
    provider: "Runway ML", 
    description: "Creative video generation with artistic styles",
    speed: "Slow",
    quality: "Premium",
    maxDuration: 20,
    features: ["Artistic styles", "Creative effects", "Long form"],
    icon: "🎨"
  },
  { 
    id: "provider-9/pika-labs", 
    name: "Pika Labs", 
    provider: "Pika", 
    description: "Fast video generation optimized for social media",
    speed: "Ultra Fast",
    quality: "Standard",
    maxDuration: 8,
    features: ["Social media ready", "Quick generation", "Mobile optimized"],
    icon: "⚡"
  }
];

const aspectRatios = [
  { id: "16:9", name: "16:9 (Landscape)", description: "Perfect for YouTube, TV", icon: "📺" },
  { id: "9:16", name: "9:16 (Portrait)", description: "Instagram Stories, TikTok", icon: "📱" },
  { id: "1:1", name: "1:1 (Square)", description: "Instagram posts, Twitter", icon: "⬜" },
  { id: "4:3", name: "4:3 (Standard)", description: "Classic TV, presentations", icon: "📽️" },
  { id: "21:9", name: "21:9 (Cinematic)", description: "Widescreen cinema", icon: "🎬" },
];

const durations = [
  { id: "3", name: "3 seconds", description: "Quick clips, GIFs" },
  { id: "5", name: "5 seconds", description: "Social media posts" },
  { id: "10", name: "10 seconds", description: "Short stories" },
  { id: "15", name: "15 seconds", description: "Detailed scenes" },
  { id: "20", name: "20 seconds", description: "Mini documentaries" },
];

const videoStyles = [
  { id: "cinematic", name: "Cinematic", description: "Movie-like quality with dramatic lighting", icon: "🎬" },
  { id: "realistic", name: "Realistic", description: "Photorealistic natural scenes", icon: "📷" },
  { id: "animated", name: "Animated", description: "Cartoon and animation style", icon: "🎨" },
  { id: "artistic", name: "Artistic", description: "Stylized and creative visuals", icon: "🖼️" },
  { id: "documentary", name: "Documentary", description: "Professional documentary style", icon: "📹" },
  { id: "vintage", name: "Vintage", description: "Retro and nostalgic feel", icon: "📼" },
];

const qualityOptions = [
  { id: "draft", name: "Draft", description: "Quick preview, lower quality", time: "30s" },
  { id: "standard", name: "Standard", description: "Balanced quality and speed", time: "2-3min" },
  { id: "high", name: "High", description: "Professional quality", time: "4-6min" },
  { id: "ultra", name: "Ultra", description: "Maximum quality", time: "8-12min" },
];

const examplePrompts = [
  {
    category: "Nature",
    prompts: [
      "A serene lake at sunset with gentle waves and birds flying overhead, cinematic camera movement",
      "Time-lapse of a flower blooming in a meadow with butterflies, macro lens perspective",
      "Majestic mountain landscape with clouds rolling through valleys, drone cinematography"
    ]
  },
  {
    category: "Urban",
    prompts: [
      "Bustling city street at night with neon lights reflecting on wet pavement, film noir style",
      "Modern skyscrapers reaching into cloudy sky, slow upward camera tilt",
      "Coffee shop interior with people working, warm lighting, handheld camera feel"
    ]
  },
  {
    category: "Abstract",
    prompts: [
      "Colorful paint mixing in water creating fluid abstract patterns, macro close-up",
      "Geometric shapes transforming and morphing in space, minimalist design",
      "Smoke trails creating artistic patterns against black background, high contrast"
    ]
  },
  {
    category: "Sci-Fi",
    prompts: [
      "Futuristic spaceship flying through asteroid field with dramatic lighting",
      "Holographic interface materializing in mid-air with glowing particles",
      "Cyberpunk city with flying cars and neon advertisements, establishing shot"
    ]
  }
];

export default function VideoGeneration() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(videoModels[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("5");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoVolume, setVideoVolume] = useState(true);

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

  const { data: generations, isLoading: generationsLoading } = useQuery<any[]>({
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
      style: selectedStyle,
      quality: selectedQuality,
    });
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard.",
    });
  };

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    toast({
      title: "Prompt Applied",
      description: "Example prompt has been added to your input.",
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
  };

  const toggleVideoPlay = (videoId: string) => {
    setPlayingVideo(prev => prev === videoId ? null : videoId);
  };

  const shareVideo = (videoUrl: string, prompt: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Generated Video',
        text: prompt,
        url: videoUrl,
      });
    } else {
      navigator.clipboard.writeText(videoUrl);
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard.",
      });
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const videoGenerations = generations?.filter((g: any) => g.type === "video") || [];
  const filteredGenerations = videoGenerations.filter((g: any) => {
    const matchesStatus = filterStatus === "all" || g.status === filterStatus;
    const matchesSearch = !searchQuery || g.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedModelData = videoModels.find(m => m.id === selectedModel);
  const selectedStyleData = videoStyles.find(s => s.id === selectedStyle);
  const selectedQualityData = qualityOptions.find(q => q.id === selectedQuality);

  return (

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Video Generation Studio</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform text prompts into professional videos with cutting-edge AI models
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-blue-600">
                <Wand2 className="w-4 h-4 mr-2" />
                Create Video
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-blue-600">
                <Video className="w-4 h-4 mr-2" />
                Video Gallery
              </TabsTrigger>
              <TabsTrigger value="examples" className="data-[state=active]:bg-blue-600 hidden lg:flex">
                <Sparkles className="w-4 h-4 mr-2" />
                Examples
              </TabsTrigger>
            </TabsList>

            {/* Create Video Tab */}
            <TabsContent value="create" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generation Form */}
                <div className="lg:col-span-2">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Film className="w-6 h-6" />
                        <span>Video Configuration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Prompt Input */}
                      <div className="space-y-2">
                        <Label htmlFor="prompt">Video Description</Label>
                        <Textarea
                          id="prompt"
                          placeholder="Describe the video you want to generate... Be specific about actions, scenes, camera movements, and style."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[120px] bg-slate-800/50 border-slate-700"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Tip: Include camera movements, lighting, and specific actions for better results.
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {prompt.length}/500
                          </span>
                        </div>
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
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{model.icon}</span>
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-xs text-muted-foreground">{model.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedModelData && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">{selectedModelData.speed}</Badge>
                            <Badge variant="outline">{selectedModelData.quality}</Badge>
                            <Badge variant="outline">Max {selectedModelData.maxDuration}s</Badge>
                          </div>
                        )}
                      </div>

                      {/* Video Style */}
                      <div className="space-y-2">
                        <Label htmlFor="style">Video Style</Label>
                        <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {videoStyles.map((style) => (
                              <SelectItem key={style.id} value={style.id}>
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{style.icon}</span>
                                  <div>
                                    <div className="font-medium">{style.name}</div>
                                    <div className="text-xs text-muted-foreground">{style.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Video Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration</Label>
                          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((duration) => (
                                <SelectItem key={duration.id} value={duration.id}>
                                  <div>
                                    <div className="font-medium">{duration.name}</div>
                                    <div className="text-xs text-muted-foreground">{duration.description}</div>
                                  </div>
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
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">{ratio.icon}</span>
                                    <div>
                                      <div className="font-medium">{ratio.name}</div>
                                      <div className="text-xs text-muted-foreground">{ratio.description}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quality">Quality</Label>
                          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {qualityOptions.map((quality) => (
                                <SelectItem key={quality.id} value={quality.id}>
                                  <div>
                                    <div className="font-medium">{quality.name}</div>
                                    <div className="text-xs text-muted-foreground">{quality.description}</div>
                                  </div>
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

                      {/* Generation Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-400">Generation Time</p>
                              <p className="text-xs text-blue-300">
                                {selectedQualityData?.time} for {selectedQualityData?.name} quality
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-400">Style Preview</p>
                              <p className="text-xs text-purple-300">
                                {selectedStyleData?.description}
                              </p>
                            </div>
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

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-6 h-6" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Reference Upload */}
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium mb-1">Upload Reference</p>
                        <p className="text-xs text-muted-foreground">Drag image or video reference</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Image className="w-4 h-4 mr-2" />
                          Browse Files
                        </Button>
                      </div>

                      {/* Model Features */}
                      {selectedModelData && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Model Features</h4>
                          <div className="space-y-1">
                            {selectedModelData.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Generations Preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Videos</h4>
                        {generationsLoading ? (
                          <div className="space-y-2">
                            {[...Array(2)].map((_, i) => (
                              <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
                            ))}
                          </div>
                        ) : videoGenerations.length === 0 ? (
                          <div className="text-center py-4">
                            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No videos yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {videoGenerations.slice(0, 3).map((generation: any) => (
                              <div key={generation.id} className="flex items-center space-x-3 p-2 bg-slate-800/30 rounded-lg">
                                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                                  {generation.result?.data?.[0]?.url ? (
                                    <video
                                      className="w-full h-full object-cover rounded-lg"
                                      poster="/placeholder-video.jpg"
                                    >
                                      <source src={generation.result.data[0].url} type="video/mp4" />
                                    </video>
                                  ) : (
                                    <Video className="w-6 h-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {generation.model.split('/')[1] || generation.model}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {generation.prompt.slice(0, 30)}...
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              {/* Gallery Controls */}
              <Card className="glass-effect border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search videos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-800/50 border-slate-700"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Videos</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Generating</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{filteredGenerations.length} videos</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Grid */}
              {generationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="loading-shimmer h-64 rounded-lg"></div>
                  ))}
                </div>
              ) : filteredGenerations.length === 0 ? (
                <Card className="glass-effect border-border">
                  <CardContent className="text-center py-16">
                    <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No videos found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterStatus !== "all" 
                        ? "Try adjusting your search or filter criteria"
                        : "Generate your first video to get started"
                      }
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      {searchQuery || filterStatus !== "all" ? "Clear Filters" : "Generate Video"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGenerations.map((generation: any) => (
                    <Card key={generation.id} className="glass-effect border-border group hover:border-blue-500/50 transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-slate-800 rounded-t-lg overflow-hidden">
                          {generation.result?.data?.[0]?.url ? (
                            <div className="relative w-full h-full">
                              <video
                                className="w-full h-full object-cover"
                                poster="/placeholder-video.jpg"
                                muted={!videoVolume}
                                autoPlay={playingVideo === generation.id}
                                loop
                              >
                                <source src={generation.result.data[0].url} type="video/mp4" />
                              </video>
                              
                              {/* Video Controls Overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleVideoPlay(generation.id)}
                                    className="bg-black/50 hover:bg-black/70"
                                  >
                                    {playingVideo === generation.id ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setVideoVolume(!videoVolume)}
                                    className="bg-black/50 hover:bg-black/70"
                                  >
                                    {videoVolume ? (
                                      <Volume2 className="w-4 h-4" />
                                    ) : (
                                      <VolumeX className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(generation.result.data[0].url, '_blank')}
                                    className="bg-black/50 hover:bg-black/70"
                                  >
                                    <Maximize className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            <Badge
                              className={`${
                                generation.status === "completed" 
                                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                  : generation.status === "failed"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }`}
                            >
                              {generation.status}
                            </Badge>
                          </div>

                          {/* Favorite Button */}
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorite(generation.id)}
                              className="bg-black/50 hover:bg-black/70 w-8 h-8 p-0"
                            >
                              <Heart
                                className={`w-4 h-4 ${favoriteIds.includes(generation.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                              />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-medium text-sm mb-1">
                              {generation.model.split('/')[1] || generation.model}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {generation.prompt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {generation.metadata?.duration || '5'}s
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {generation.metadata?.aspect_ratio || '16:9'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyPrompt(generation.prompt)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy prompt</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {generation.result?.data?.[0]?.url && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => shareVideo(generation.result.data[0].url, generation.prompt)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Share2 className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share video</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {generation.result?.data?.[0]?.url && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = generation.result.data[0].url;
                                          link.download = `video-${generation.id}.mp4`;
                                          link.click();
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download video</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-6">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-6 h-6" />
                    <span>Prompt Examples & Inspiration</span>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Get inspired with curated prompts organized by category
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {examplePrompts.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>{category.category}</span>
                      </h3>
                      <div className="grid gap-3">
                        {category.prompts.map((examplePrompt, promptIndex) => (
                          <Card key={promptIndex} className="bg-slate-800/30 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-muted-foreground group-hover:text-white transition-colors flex-1 mr-3">
                                  {examplePrompt}
                                </p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => useExamplePrompt(examplePrompt)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  Use
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
