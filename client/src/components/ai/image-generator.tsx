import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  Wand2, 
  Download, 
  Loader2,
  Settings,
  Image as ImageIcon,
  Palette
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ImageGeneratorProps {
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
  }>;
}

export default function ImageGenerator({ selectedModel, onModelChange, models }: ImageGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [style, setStyle] = useState("vivid");
  const [numberOfImages, setNumberOfImages] = useState([1]);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  const generateImageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/image/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImages(prev => [data, ...prev]);
      toast({
        title: "Image generated successfully!",
        description: data.enhancedPrompt 
          ? "Prompt was enhanced for better results" 
          : "Image created with your prompt",
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
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your image",
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

    generateImageMutation.mutate({
      model: selectedModel,
      prompt: prompt.trim(),
      enhance: enhancePrompt,
      n: numberOfImages[0],
      size,
      quality,
      style,
    });
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sizes = [
    { value: "1024x1024", label: "1024×1024 (Square)" },
    { value: "1792x1024", label: "1792×1024 (Landscape)" },
    { value: "1024x1792", label: "1024×1792 (Portrait)" },
  ];

  const qualities = [
    { value: "standard", label: "Standard Quality" },
    { value: "hd", label: "HD Quality" },
  ];

  const styles = [
    { value: "vivid", label: "Vivid (Dramatic)" },
    { value: "natural", label: "Natural (Realistic)" },
  ];

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
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
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Prompt Enhancement */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>AI Prompt Enhancement</Label>
              <p className="text-sm text-muted-foreground">
                Automatically improve your prompt for better results
              </p>
            </div>
            <Switch
              checked={enhancePrompt}
              onCheckedChange={setEnhancePrompt}
            />
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Size */}
            <div className="space-y-2">
              <Label>Image Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((sizeOption) => (
                    <SelectItem key={sizeOption.value} value={sizeOption.value}>
                      {sizeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((qualityOption) => (
                    <SelectItem key={qualityOption.value} value={qualityOption.value}>
                      {qualityOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((styleOption) => (
                    <SelectItem key={styleOption.value} value={styleOption.value}>
                      {styleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Images */}
            <div className="space-y-2">
              <Label>Number of Images: {numberOfImages[0]}</Label>
              <Slider
                value={numberOfImages}
                onValueChange={setNumberOfImages}
                max={4}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generateImageMutation.isPending || !prompt.trim()}
            className="w-full btn-depth"
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
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Generated Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((imageData, index) => (
                <div key={index} className="space-y-4">
                  {imageData.result?.data?.map((image: any, imgIndex: number) => (
                    <div key={imgIndex} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={`Generated image ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Image Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image.url, `generated-${Date.now()}.png`)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Enhanced Prompt Display */}
                      {imageData.enhancedPrompt && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Enhanced Prompt:</p>
                          <p className="text-sm text-muted-foreground">
                            {imageData.enhancedPrompt}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && (
        <Card className="glass-effect">
          <CardContent className="py-12 text-center">
            <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ready to Create</h3>
            <p className="text-muted-foreground">
              Enter a prompt above and generate your first AI image
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
