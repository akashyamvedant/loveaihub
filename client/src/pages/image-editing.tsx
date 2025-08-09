import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Upload, 
  Download, 
  Loader2,
  Copy,
  ExternalLink,
  Brush,
  Image as ImageIcon,
  Scissors
} from "lucide-react";

const editingModels = [
  { id: "provider-3/flux-kontext-pro", name: "FLUX Kontext Pro", provider: "Provider 3", description: "Professional editing" },
  { id: "provider-6/black-forest-labs-flux-1-kontext-dev", name: "FLUX Kontext Dev", provider: "Provider 6", description: "Development model" },
  { id: "provider-6/black-forest-labs-flux-1-kontext-pro", name: "FLUX Kontext Pro", provider: "Provider 6", description: "Production ready" },
  { id: "provider-6/black-forest-labs-flux-1-kontext-max", name: "FLUX Kontext Max", provider: "Provider 6", description: "Maximum quality" },
];

export default function ImageEditing() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const maskInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(editingModels[0].id);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedMask, setSelectedMask] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);

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

  const editImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/edit/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Edited Successfully",
        description: "Your edited image has been generated and saved to your history.",
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
        title: "Editing Failed",
        description: error.message || "Failed to edit image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: generations, isLoading: generationsLoading } = useQuery({
    queryKey: ["/api/generations"],
    enabled: isAuthenticated,
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaskSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMask(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMaskPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = () => {
    if (!selectedImage) {
      toast({
        title: "Image Required",
        description: "Please select an image to edit.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt describing the edit you want to make.",
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

    const formData = new FormData();
    formData.append("image", selectedImage);
    if (selectedMask) {
      formData.append("mask", selectedMask);
    }
    formData.append("model", selectedModel);
    formData.append("prompt", prompt);

    editImageMutation.mutate(formData);
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

  const editGenerations = (generations as any)?.filter((g: any) => g.type === "image_edit") || [];

  return (
    <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Image Editing Suite</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Professional AI-powered image editing with inpainting, outpainting, and style transfer
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editing Form */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brush className="w-6 h-6" />
                    <span>Edit Image</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Original Image</Label>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Image</span>
                        </Button>
                        {selectedImage && (
                          <span className="text-sm text-muted-foreground">
                            {selectedImage.name}
                          </span>
                        )}
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="Selected image"
                          className="w-full h-auto rounded-lg border border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Mask Upload (Optional) */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mask">Mask Image (Optional)</Label>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => maskInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Scissors className="w-4 h-4" />
                          <span>Choose Mask</span>
                        </Button>
                        {selectedMask && (
                          <span className="text-sm text-muted-foreground">
                            {selectedMask.name}
                          </span>
                        )}
                      </div>
                      <input
                        ref={maskInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMaskSelect}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a mask to specify which areas to edit. White areas will be edited, black areas will be preserved.
                      </p>
                    </div>

                    {/* Mask Preview */}
                    {maskPreview && (
                      <div className="w-full max-w-md">
                        <img
                          src={maskPreview}
                          alt="Mask image"
                          className="w-full h-auto rounded-lg border border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Edit Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Edit Instructions</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what you want to change in the image..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] bg-slate-800/50 border-slate-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about what you want to add, remove, or change in the image.
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
                        {editingModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Edit Button */}
                  <Button
                    onClick={handleEditImage}
                    disabled={editImageMutation.isPending || !selectedImage || !prompt.trim()}
                    className="btn-primary w-full"
                    size="lg"
                  >
                    {editImageMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Editing Image...
                      </>
                    ) : (
                      <>
                        <Brush className="w-5 h-5 mr-2" />
                        Edit Image
                      </>
                    )}
                  </Button>

                  {/* Tips */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">Editing Tips</h4>
                    <ul className="text-sm text-blue-300 space-y-1">
                      <li>• Use high-resolution images for best results</li>
                      <li>• Create precise masks for targeted edits</li>
                      <li>• Be descriptive in your edit instructions</li>
                      <li>• White mask areas = edit, black mask areas = preserve</li>
                    </ul>
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

            {/* Recent Edits */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="w-6 h-6" />
                    <span>Recent Edits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="loading-shimmer h-32 rounded-lg"></div>
                      ))}
                    </div>
                  ) : editGenerations.length === 0 ? (
                    <div className="text-center py-8">
                      <Edit className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No edits made yet</p>
                      <p className="text-sm text-muted-foreground">Your edited images will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editGenerations.slice(0, 5).map((generation: any) => (
                        <div key={generation.id} className="glass-effect rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              {generation.result?.data?.[0]?.url ? (
                                <img
                                  src={generation.result.data[0].url}
                                  alt="Edited"
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
    </div>
  );
}
