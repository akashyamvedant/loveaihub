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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  Image as ImageIcon, 
  Download, 
  Settings, 
  Sparkles, 
  Loader2,
  Copy,
  ExternalLink,
  Wand2
} from "lucide-react";

const imageModels = [
  { id: "provider-6/gpt-image-1", name: "GPT Image 1", provider: "Provider 6" },
  { id: "provider-2/dall-e-3", name: "DALL-E 3", provider: "Provider 2" },
  { id: "provider-3/dall-e-3", name: "DALL-E 3", provider: "Provider 3" },
  { id: "provider-4/imagen-3", name: "Imagen 3", provider: "Provider 4" },
  { id: "provider-4/imagen-4", name: "Imagen 4", provider: "Provider 4" },
  { id: "provider-3/imagen-3.0-generate-002", name: "Imagen 3.0", provider: "Provider 3" },
  { id: "provider-3/imagen-4.0-generate-preview-06-06", name: "Imagen 4.0 Preview", provider: "Provider 3" },
  { id: "provider-6/sana-1.5", name: "Sana 1.5", provider: "Provider 6" },
  { id: "provider-6/sana-1.5-flash", name: "Sana 1.5 Flash", provider: "Provider 6" },
  { id: "provider-1/FLUX-1-schnell", name: "FLUX-1 Schnell", provider: "Provider 1" },
  { id: "provider-2/FLUX-1-schnell", name: "FLUX-1 Schnell", provider: "Provider 2" },
  { id: "provider-3/FLUX-1-schnell", name: "FLUX-1 Schnell", provider: "Provider 3" },
  { id: "provider-2/FLUX-1-schnell-v2", name: "FLUX-1 Schnell v2", provider: "Provider 2" },
  { id: "provider-1/FLUX-1-dev", name: "FLUX-1 Dev", provider: "Provider 1" },
  { id: "provider-2/FLUX-1-dev", name: "FLUX-1 Dev", provider: "Provider 2" },
  { id: "provider-3/FLUX-1-dev", name: "FLUX-1 Dev", provider: "Provider 3" },
  { id: "provider-6/FLUX-1-dev", name: "FLUX-1 Dev", provider: "Provider 6" },
  { id: "provider-6/FLUX-1-pro", name: "FLUX-1 Pro", provider: "Provider 6" },
  { id: "provider-1/FLUX.1.1-pro", name: "FLUX 1.1 Pro", provider: "Provider 1" },
  { id: "provider-2/FLUX.1.1-pro", name: "FLUX 1.1 Pro", provider: "Provider 2" },
  { id: "provider-3/FLUX.1.1-pro-ultra", name: "FLUX 1.1 Pro Ultra", provider: "Provider 3" },
  { id: "provider-3/FLUX.1.1-pro-ultra-raw", name: "FLUX 1.1 Pro Ultra Raw", provider: "Provider 3" },
];

const imageSizes = [
  { id: "1024x1024", name: "Square (1024x1024)" },
  { id: "1792x1024", name: "Landscape (1792x1024)" },
  { id: "1024x1792", name: "Portrait (1024x1792)" },
  { id: "512x512", name: "Small Square (512x512)" },
];

export default function ImageGeneration() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(imageModels[0].id);
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [style, setStyle] = useState("vivid");
  const [numImages, setNumImages] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const generateImageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/generate/image", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Generated Successfully",
        description: "Your image has been generated and saved to your history.",
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
        description: error.message || "Failed to generate image. Please try again.",
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
        description: "Please enter a prompt to generate an image.",
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

    generateImageMutation.mutate({
      model: selectedModel,
      prompt,
      n: numImages,
      size: selectedSize,
      quality,
      style,
      enhancePrompt,
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

  const imageGenerations = generations?.filter((g: any) => g.type === "image") || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Image Generation Studio</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Create stunning images with 20+ state-of-the-art AI models
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Form */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="w-6 h-6" />
                    <span>Generate Image</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe the image you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] bg-slate-800/50 border-slate-700"
                    />
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {imageModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} ({model.provider})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Image Size</Label>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageSizes.map((size) => (
                            <SelectItem key={size.id} value={size.id}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numImages">Number of Images</Label>
                      <Input
                        id="numImages"
                        type="number"
                        min="1"
                        max="4"
                        value={numImages}
                        onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
                        className="bg-slate-800/50 border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Enhance Prompt Option */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enhance"
                      checked={enhancePrompt}
                      onCheckedChange={setEnhancePrompt}
                    />
                    <Label htmlFor="enhance" className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Enhance prompt with AI</span>
                    </Label>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advanced"
                      checked={showAdvanced}
                      onCheckedChange={setShowAdvanced}
                    />
                    <Label htmlFor="advanced" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Advanced Options</span>
                    </Label>
                  </div>

                  {/* Advanced Options */}
                  {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quality">Quality</Label>
                          <Select value={quality} onValueChange={setQuality}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="hd">HD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="style">Style</Label>
                          <Select value={style} onValueChange={setStyle}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vivid">Vivid</SelectItem>
                              <SelectItem value="natural">Natural</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={generateImageMutation.isPending || !prompt.trim()}
                    className="btn-primary w-full"
                    size="lg"
                  >
                    {generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

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
                    <ImageIcon className="w-6 h-6" />
                    <span>Recent Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="loading-shimmer h-32 rounded-lg"></div>
                      ))}
                    </div>
                  ) : imageGenerations.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No images generated yet</p>
                      <p className="text-sm text-muted-foreground">Your generated images will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imageGenerations.slice(0, 5).map((generation: any) => (
                        <div key={generation.id} className="glass-effect rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              {generation.result?.data?.[0]?.url ? (
                                <img
                                  src={generation.result.data[0].url}
                                  alt="Generated"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {generation.model.split('/')[1] || generation.model}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {generation.prompt}
                              </p>
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
                                    <ExternalLink className="w-3 h-3" />
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
