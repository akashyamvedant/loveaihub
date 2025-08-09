import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image as ImageIcon, 
  Download, 
  Settings, 
  Sparkles, 
  Loader2,
  Copy,
  ExternalLink,
  Wand2,
  Info,
  Zap,
  Palette,
  Camera,
  Heart,
  Star,
  TrendingUp,
  Maximize2,
  X,
  GripVertical,
  ChevronDown,
  Lightbulb,
  Clock,
  Users,
  CheckCircle,
  Share2,
  Trash2,
  Filter,
  Grid3X3,
  List,
  Search,
  SortDesc,
  RefreshCw,
  CloudDownload,
  HeartIcon,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Complete A4F.co image models list
const imageModels = [
  {
    id: "provider-2/flux.1-schnell",
    name: "FLUX-1 Schnell",
    provider: "Provider 1",
    description: "Ultra-fast image generation for quick iterations",
    speed: "Ultra Fast",
    quality: "Good",
    category: "Speed",
    thumbnail: "⚡"
  },
  { 
    id: "provider-2/dall-e-3", 
    name: "DALL-E 3", 
    provider: "Provider 2",
    description: "Industry-leading photorealistic image generation",
    speed: "Medium",
    quality: "Premium",
    category: "Photorealistic",
    thumbnail: "🖼️"
  },
  { 
    id: "provider-3/dall-e-3", 
    name: "DALL-E 3", 
    provider: "Provider 3",
    description: "High-quality creative image synthesis",
    speed: "Medium",
    quality: "Premium",
    category: "Creative",
    thumbnail: "🎭"
  },
  { 
    id: "provider-4/imagen-3", 
    name: "Imagen 3", 
    provider: "Provider 4",
    description: "Google's advanced text-to-image model",
    speed: "Fast",
    quality: "High",
    category: "General",
    thumbnail: "🌟"
  },
  { 
    id: "provider-4/imagen-4", 
    name: "Imagen 4", 
    provider: "Provider 4",
    description: "Latest Google Imagen with enhanced details",
    speed: "Medium",
    quality: "Premium",
    category: "Detailed",
    thumbnail: "⭐"
  },
  { 
    id: "provider-3/imagen-3.0-generate-002", 
    name: "Imagen 3.0", 
    provider: "Provider 3",
    description: "Google Imagen 3.0 generation model",
    speed: "Fast",
    quality: "High",
    category: "General",
    thumbnail: "🔮"
  },
  { 
    id: "provider-3/imagen-4.0-generate-preview-06-06", 
    name: "Imagen 4.0 Preview", 
    provider: "Provider 3",
    description: "Preview version of Google Imagen 4.0",
    speed: "Medium",
    quality: "Premium",
    category: "Preview",
    thumbnail: "🚀"
  },
  { 
    id: "provider-6/sana-1.5", 
    name: "Sana 1.5", 
    provider: "Provider 6",
    description: "High-efficiency image generation model",
    speed: "Fast",
    quality: "High",
    category: "Efficient",
    thumbnail: "💎"
  },
  { 
    id: "provider-6/sana-1.5-flash", 
    name: "Sana 1.5 Flash", 
    provider: "Provider 6",
    description: "Ultra-fast Sana model for quick generation",
    speed: "Ultra Fast",
    quality: "Good",
    category: "Speed",
    thumbnail: "⚡"
  },
  { 
    id: "provider-2/FLUX-1-schnell", 
    name: "FLUX-1 Schnell", 
    provider: "Provider 2",
    description: "Ultra-fast image generation for quick iterations",
    speed: "Ultra Fast",
    quality: "Good",
    category: "Speed",
    thumbnail: "🔥"
  },
  { 
    id: "provider-3/FLUX-1-schnell", 
    name: "FLUX-1 Schnell", 
    provider: "Provider 3",
    description: "Ultra-fast image generation for quick iterations",
    speed: "Ultra Fast",
    quality: "Good",
    category: "Speed",
    thumbnail: "🔥"
  },
  { 
    id: "provider-2/FLUX-1-schnell-v2", 
    name: "FLUX-1 Schnell v2", 
    provider: "Provider 2",
    description: "Updated version of FLUX Schnell with improvements",
    speed: "Ultra Fast",
    quality: "Good",
    category: "Speed",
    thumbnail: "🔥"
  },
  { 
    id: "provider-1/FLUX-1-dev", 
    name: "FLUX-1 Dev", 
    provider: "Provider 1",
    description: "Developer-optimized model for experimentation",
    speed: "Fast",
    quality: "High",
    category: "Development",
    thumbnail: "🔧"
  },
  { 
    id: "provider-2/FLUX-1-dev", 
    name: "FLUX-1 Dev", 
    provider: "Provider 2",
    description: "Developer-optimized model for experimentation",
    speed: "Fast",
    quality: "High",
    category: "Development",
    thumbnail: "🔧"
  },
  { 
    id: "provider-3/FLUX-1-dev", 
    name: "FLUX-1 Dev", 
    provider: "Provider 3",
    description: "Developer-optimized model for experimentation",
    speed: "Fast",
    quality: "High",
    category: "Development",
    thumbnail: "🔧"
  },
  { 
    id: "provider-6/FLUX-1-dev", 
    name: "FLUX-1 Dev", 
    provider: "Provider 6",
    description: "Developer-optimized model for experimentation",
    speed: "Fast",
    quality: "High",
    category: "Development",
    thumbnail: "🔧"
  },
  { 
    id: "provider-6/FLUX-1-pro", 
    name: "FLUX-1 Pro", 
    provider: "Provider 6",
    description: "Professional-grade image generation",
    speed: "Medium",
    quality: "Premium",
    category: "Professional",
    thumbnail: "💎"
  },
  { 
    id: "provider-1/FLUX.1.1-pro", 
    name: "FLUX 1.1 Pro", 
    provider: "Provider 1",
    description: "Enhanced FLUX Pro with improved capabilities",
    speed: "Medium",
    quality: "Premium",
    category: "Professional",
    thumbnail: "💎"
  },
  { 
    id: "provider-2/FLUX.1.1-pro", 
    name: "FLUX 1.1 Pro", 
    provider: "Provider 2",
    description: "Enhanced FLUX Pro with improved capabilities",
    speed: "Medium",
    quality: "Premium",
    category: "Professional",
    thumbnail: "💎"
  },
  { 
    id: "provider-3/FLUX.1.1-pro-ultra", 
    name: "FLUX 1.1 Pro Ultra", 
    provider: "Provider 3",
    description: "Ultra-high quality FLUX generation",
    speed: "Slow",
    quality: "Ultra",
    category: "Ultra Quality",
    thumbnail: "💠"
  },
  { 
    id: "provider-3/FLUX.1.1-pro-ultra-raw", 
    name: "FLUX 1.1 Pro Ultra Raw", 
    provider: "Provider 3",
    description: "Raw ultra-quality FLUX with maximum detail",
    speed: "Slow",
    quality: "Ultra",
    category: "Ultra Quality",
    thumbnail: "💠"
  },
  { 
    id: "provider-6/FLUX-1-1-pro", 
    name: "FLUX 1.1 Pro", 
    provider: "Provider 6",
    description: "Enhanced FLUX Pro with improved capabilities",
    speed: "Medium",
    quality: "Premium",
    category: "Professional",
    thumbnail: "💎"
  },
  { 
    id: "provider-1/FLUX-1-kontext-pro", 
    name: "FLUX-1 Kontext Pro", 
    provider: "Provider 1",
    description: "Context-aware FLUX model for detailed scenes",
    speed: "Medium",
    quality: "Premium",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-2/FLUX-1-kontext-pro", 
    name: "FLUX-1 Kontext Pro", 
    provider: "Provider 2",
    description: "Context-aware FLUX model for detailed scenes",
    speed: "Medium",
    quality: "Premium",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-6/FLUX-1-kontext-pro", 
    name: "FLUX-1 Kontext Pro", 
    provider: "Provider 6",
    description: "Context-aware FLUX model for detailed scenes",
    speed: "Medium",
    quality: "Premium",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-2/FLUX-1-kontext-max", 
    name: "FLUX-1 Kontext Max", 
    provider: "Provider 2",
    description: "Maximum context-aware FLUX capabilities",
    speed: "Slow",
    quality: "Ultra",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-6/FLUX-1-kontext-max", 
    name: "FLUX-1 Kontext Max", 
    provider: "Provider 6",
    description: "Maximum context-aware FLUX capabilities",
    speed: "Slow",
    quality: "Ultra",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-6/FLUX-1-kontext-dev", 
    name: "FLUX-1 Kontext Dev", 
    provider: "Provider 6",
    description: "Development version of context-aware FLUX",
    speed: "Fast",
    quality: "High",
    category: "Context",
    thumbnail: "🧠"
  },
  { 
    id: "provider-3/shuttle-3.1-aesthetic", 
    name: "Shuttle 3.1 Aesthetic", 
    provider: "Provider 3",
    description: "Aesthetically optimized image generation",
    speed: "Medium",
    quality: "Premium",
    category: "Aesthetic",
    thumbnail: "🎨"
  },
  { 
    id: "provider-3/shuttle-3-diffusion", 
    name: "Shuttle 3 Diffusion", 
    provider: "Provider 3",
    description: "Advanced diffusion-based image generation",
    speed: "Medium",
    quality: "High",
    category: "Diffusion",
    thumbnail: "🌊"
  },
  { 
    id: "provider-3/shuttle-jaguar", 
    name: "Shuttle Jaguar", 
    provider: "Provider 3",
    description: "High-speed premium image generation",
    speed: "Fast",
    quality: "Premium",
    category: "Speed",
    thumbnail: "🐆"
  },
];

const imageSizes = [
  { id: "1024x1024", name: "Square (1024x1024)", icon: "⬜" },
  { id: "1792x1024", name: "Landscape (1792x1024)", icon: "📱" },
  { id: "1024x1792", name: "Portrait (1024x1792)", icon: "📲" },
  { id: "512x512", name: "Small Square (512x512)", icon: "🔳" },
];

const promptTemplates = [
  {
    category: "Portrait",
    icon: "👤",
    templates: [
      "Professional headshot of a person in business attire, studio lighting, high resolution, sharp focus, elegant composition",
      "Artistic portrait with dramatic lighting and moody atmosphere, chiaroscuro style, professional photography",
      "Fantasy character portrait with magical elements and mystical background, detailed fantasy art, ethereal lighting"
    ]
  },
  {
    category: "Landscape",
    icon: "🏔️",
    templates: [
      "Breathtaking mountain landscape during golden hour with misty valleys, epic scenery, cinematic lighting, ultra-detailed",
      "Serene lake reflection with forest and dramatic sky at sunset, peaceful atmosphere, nature photography style",
      "Ancient forest with ethereal light beams filtering through trees, magical atmosphere, fantasy landscape"
    ]
  },
  {
    category: "Abstract",
    icon: "🎨",
    templates: [
      "Colorful abstract composition with flowing geometric shapes, vibrant colors, modern digital art style",
      "Digital art with neon colors and futuristic patterns, cyberpunk aesthetic, glowing effects",
      "Minimalist abstract design with bold colors and clean lines, contemporary art style, high contrast"
    ]
  },
  {
    category: "Architecture",
    icon: "🏛️",
    templates: [
      "Modern architectural building with glass facade and geometric design, urban photography, clean lines",
      "Ancient temple with intricate stone carvings and atmospheric lighting, historical architecture",
      "Futuristic cityscape with neon lights and flying vehicles, sci-fi concept art, cyberpunk city"
    ]
  }
];

// Image Gallery Component
const ImageGallery = ({ generations, onImageAction }: { 
  generations: any[]; 
  onImageAction: (action: string, generation: any) => void;
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const filteredGenerations = generations
    .filter(g => g.type === 'image' && g.status === 'completed')
    .filter(g => filterCategory === 'all' || g.model.includes(filterCategory))
    .filter(g => searchTerm === '' || g.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const shareImage = async (url: string, prompt: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: prompt,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gallery Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="FLUX">FLUX Models</SelectItem>
              <SelectItem value="dall-e">DALL-E Models</SelectItem>
              <SelectItem value="imagen">Imagen Models</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gallery Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {filteredGenerations.map((generation, index) => (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={viewMode === 'grid' 
                ? "glass-effect rounded-lg overflow-hidden group hover:scale-105 transition-all duration-200" 
                : "glass-effect rounded-lg p-4 flex items-center space-x-4"
              }
            >
              {viewMode === 'grid' ? (
                <div>
                  <div className="relative aspect-square overflow-hidden">
                    {generation.result?.data?.[0]?.url ? (
                      <img
                        src={generation.result.data[0].url}
                        alt={generation.prompt}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(generation)}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(generation)}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      {generation.result?.data?.[0]?.url && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(
                              generation.result.data[0].url, 
                              `generated-image-${generation.id}.png`
                            )}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => shareImage(generation.result.data[0].url, generation.prompt)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onImageAction('favorite', generation)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onImageAction('delete', generation)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm font-medium truncate mb-1">
                      {generation.model.split('/')[1] || generation.model}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {generation.prompt}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(generation.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {imageSizes.find(s => s.id === generation.metadata?.size)?.icon || "📐"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {generation.result?.data?.[0]?.url ? (
                      <img
                        src={generation.result.data[0].url}
                        alt={generation.prompt}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(generation)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {generation.model.split('/')[1] || generation.model}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {generation.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(generation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {generation.result?.data?.[0]?.url && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadImage(
                            generation.result.data[0].url, 
                            `generated-image-${generation.id}.png`
                          )}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareImage(generation.result.data[0].url, generation.prompt)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onImageAction('favorite', generation)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onImageAction('delete', generation)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-full bg-slate-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedImage.model.split('/')[1] || selectedImage.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedImage.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              {selectedImage.result?.data?.[0]?.url && (
                <div className="relative">
                  <img
                    src={selectedImage.result.data[0].url}
                    alt={selectedImage.prompt}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                  
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => downloadImage(
                        selectedImage.result.data[0].url,
                        `generated-image-${selectedImage.id}.png`
                      )}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareImage(selectedImage.result.data[0].url, selectedImage.prompt)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t border-slate-700">
                <h4 className="text-sm font-medium mb-2">Prompt</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedImage.prompt}
                </p>
                {selectedImage.metadata && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Size: </span>
                      {selectedImage.metadata.size || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality: </span>
                      {selectedImage.metadata.quality || 'Standard'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredGenerations.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No images found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Generate your first image to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

const SkeletonLoader = ({ className = "" }: { className?: string }) => (
  <div className={`loading-shimmer ${className}`} />
);

export default function ImageGeneration() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("provider-2/flux.1-schnell");
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [quality, setQuality] = useState("standard");
  const [style, setStyle] = useState("vivid");
  const [numImages, setNumImages] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [draggedTemplate, setDraggedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

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
        description: "Your image has been generated and saved to your gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setActiveTab('gallery'); // Switch to gallery tab after generation
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
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/generations");
      return await response.json();
    },
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

  const handleTemplateSelect = (template: string) => {
    setPrompt(template);
    setShowTemplates(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDragStart = (template: string) => {
    setDraggedTemplate(template);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTemplate) {
      setPrompt(draggedTemplate);
      setDraggedTemplate(null);
    }
  };

  const favoriteImageMutation = useMutation({
    mutationFn: async (generationId: string) => {
      const response = await apiRequest("POST", `/api/generations/${generationId}/favorite`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.favorited ? "Added to Favorites" : "Removed from Favorites",
        description: data.favorited ? "Image has been saved to your favorites." : "Image has been removed from your favorites.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (generationId: string) => {
      const response = await apiRequest("DELETE", `/api/generations/${generationId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Image Deleted",
        description: "Image has been removed from your gallery.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  });

  const handleImageAction = (action: string, generation: any) => {
    switch (action) {
      case 'favorite':
        favoriteImageMutation.mutate(generation.id);
        break;
      case 'delete':
        deleteImageMutation.mutate(generation.id);
        break;
      case 'download':
        if (generation.result?.data?.[0]?.url) {
          const link = document.createElement('a');
          link.href = generation.result.data[0].url;
          link.download = `generated-image-${generation.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({
            title: "Download Started",
            description: "Your image is being downloaded.",
          });
        }
        break;
      case 'share':
        if (generation.result?.data?.[0]?.url && navigator.share) {
          navigator.share({
            title: 'AI Generated Image',
            text: generation.prompt,
            url: generation.result.data[0].url
          }).catch(() => {
            navigator.clipboard.writeText(generation.result.data[0].url);
            toast({
              title: "Link Copied",
              description: "Image link copied to clipboard.",
            });
          });
        } else if (generation.result?.data?.[0]?.url) {
          navigator.clipboard.writeText(generation.result.data[0].url);
          toast({
            title: "Link Copied",
            description: "Image link copied to clipboard.",
          });
        }
        break;
      default:
        break;
    }
  };

  const selectedModelData = imageModels.find(m => m.id === selectedModel);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const imageGenerations = generations?.filter((g: any) => g.type === 'image' && g.status === 'completed') || [];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="gradient-text">AI Image Generation Studio</span>
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Create stunning images with 30+ state-of-the-art AI models from A4F.co
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="generate" className="flex items-center space-x-2">
                  <Wand2 className="w-4 h-4" />
                  <span>Generate</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Gallery ({imageGenerations.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Generate Tab */}
              <TabsContent value="generate">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Generation Form */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-2"
                  >
                    <Card className="glass-effect border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Wand2 className="w-6 h-6" />
                            <span>Generate Image</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Templates
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Prompt Templates */}
                        <AnimatePresence>
                          {showTemplates && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border border-slate-700 rounded-lg p-4 bg-slate-800/30"
                            >
                              <h3 className="text-sm font-medium mb-3 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Prompt Templates
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {promptTemplates.map((category) => (
                                  <div key={category.category} className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                                      <span>{category.icon}</span>
                                      <span>{category.category}</span>
                                    </div>
                                    {category.templates.map((template, idx) => (
                                      <motion.div
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(template)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="text-xs p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700 transition-colors border-l-2 border-transparent hover:border-primary template-card"
                                        onClick={() => handleTemplateSelect(template)}
                                      >
                                        <GripVertical className="w-3 h-3 inline mr-2 text-muted-foreground" />
                                        {template.substring(0, 60)}...
                                      </motion.div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Prompt Input */}
                        <motion.div 
                          className="space-y-2"
                          whileFocus={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          <Label htmlFor="prompt">Prompt</Label>
                          <Textarea
                            ref={textareaRef}
                            id="prompt"
                            placeholder="Describe the image you want to generate... (Try dragging a template here!)"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="min-h-[100px] bg-slate-800/50 border-slate-700 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </motion.div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="model" className="flex items-center space-x-2">
                            <span>AI Model</span>
                            {selectedModelData && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs tooltip-content">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-2xl">{selectedModelData.thumbnail}</span>
                                      <div>
                                        <p className="font-medium">{selectedModelData.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedModelData.provider}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm">{selectedModelData.description}</p>
                                    <div className="flex space-x-4 text-xs">
                                      <div className="flex items-center space-x-1">
                                        <Zap className="w-3 h-3" />
                                        <span>{selectedModelData.speed}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3" />
                                        <span>{selectedModelData.quality}</span>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {selectedModelData.category}
                                    </Badge>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Label>
                          <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 transition-all duration-200 hover:border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                              {imageModels.map((model) => (
                                <SelectItem key={model.id} value={model.id} className="model-card">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">{model.thumbnail}</span>
                                    <div>
                                      <div className="font-medium">{model.name}</div>
                                      <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                        <span>{model.provider}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {model.category}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Basic Options */}
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div 
                            className="space-y-2"
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          >
                            <Label htmlFor="size">Image Size</Label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 transition-all duration-200 hover:border-slate-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {imageSizes.map((size) => (
                                  <SelectItem key={size.id} value={size.id}>
                                    <div className="flex items-center space-x-2">
                                      <span>{size.icon}</span>
                                      <span>{size.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>

                          <motion.div 
                            className="space-y-2"
                            whileFocus={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          >
                            <Label htmlFor="numImages">Number of Images</Label>
                            <Input
                              id="numImages"
                              type="number"
                              min="1"
                              max="4"
                              value={numImages}
                              onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
                              className="bg-slate-800/50 border-slate-700 transition-all duration-200 focus:border-primary"
                            />
                          </motion.div>
                        </div>

                        {/* Enhanced Toggle Options */}
                        <div className="space-y-3">
                          <motion.div 
                            className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 transition-all duration-200 hover:bg-slate-800/50"
                            whileHover={{ scale: 1.01 }}
                          >
                            <Switch
                              id="enhance"
                              checked={enhancePrompt}
                              onCheckedChange={setEnhancePrompt}
                            />
                            <Label htmlFor="enhance" className="flex items-center space-x-2 cursor-pointer flex-1">
                              <Sparkles className="w-4 h-4 text-yellow-400" />
                              <span>Enhance prompt with AI (GPT-4o)</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                Smart
                              </Badge>
                            </Label>
                          </motion.div>

                          <motion.div 
                            className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/30 transition-all duration-200 hover:bg-slate-800/50"
                            whileHover={{ scale: 1.01 }}
                          >
                            <Switch
                              id="advanced"
                              checked={showAdvanced}
                              onCheckedChange={setShowAdvanced}
                            />
                            <Label htmlFor="advanced" className="flex items-center space-x-2 cursor-pointer flex-1">
                              <Settings className="w-4 h-4" />
                              <span>Advanced Options</span>
                            </Label>
                          </motion.div>
                        </div>

                        {/* Advanced Options */}
                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4 pt-4 border-t border-slate-700"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="quality">Quality</Label>
                                  <Select value={quality} onValueChange={setQuality}>
                                    <SelectTrigger className="bg-slate-800/50 border-slate-700">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="standard">
                                        <div className="flex items-center space-x-2">
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Standard</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="hd">
                                        <div className="flex items-center space-x-2">
                                          <Star className="w-4 h-4" />
                                          <span>HD</span>
                                        </div>
                                      </SelectItem>
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
                                      <SelectItem value="vivid">
                                        <div className="flex items-center space-x-2">
                                          <Palette className="w-4 h-4" />
                                          <span>Vivid</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="natural">
                                        <div className="flex items-center space-x-2">
                                          <Camera className="w-4 h-4" />
                                          <span>Natural</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Separator />

                        {/* Generate Button with Enhanced Loading */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleGenerate}
                            disabled={generateImageMutation.isPending || !prompt.trim()}
                            className="btn-primary w-full relative overflow-hidden"
                            size="lg"
                          >
                            {generateImageMutation.isPending ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                <span className="animate-pulse">Generating with A4F.co...</span>
                                <div className="absolute bottom-0 left-0 h-1 bg-primary-foreground/30 progress-enhanced" style={{ width: '60%' }} />
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-5 h-5 mr-2" />
                                Generate Image
                              </>
                            )}
                          </Button>
                        </motion.div>

                        {/* Enhanced Usage Indicator */}
                        {user?.subscriptionType === "free" && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Free Plan Usage
                              </span>
                              <span className="text-sm font-medium">
                                {user.generationsUsed} / {user.generationsLimit}
                              </span>
                            </div>
                            <Progress 
                              value={(user.generationsUsed / user.generationsLimit) * 100} 
                              className="h-2 mb-2" 
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{user.generationsLimit - user.generationsUsed} generations remaining</span>
                              <span className="text-primary">Upgrade for unlimited</span>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Recent Generations Sidebar */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-1"
                  >
                    <Card className="glass-effect border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <ImageIcon className="w-6 h-6" />
                          <span>Recent Images</span>
                          {imageGenerations.length > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {imageGenerations.length}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {generationsLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="flex space-x-3">
                                <SkeletonLoader className="w-16 h-16 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                  <SkeletonLoader className="h-4 w-3/4" />
                                  <SkeletonLoader className="h-3 w-1/2" />
                                  <div className="flex space-x-2">
                                    <SkeletonLoader className="h-6 w-6" />
                                    <SkeletonLoader className="h-6 w-6" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : imageGenerations.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <motion.div
                              animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            </motion.div>
                            <h3 className="text-lg font-medium mb-2">Ready to Create?</h3>
                            <p className="text-muted-foreground mb-4">Your generated images will appear here</p>
                            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Sparkles className="w-4 h-4" />
                                <span>AI-Powered</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Fast Generation</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                              {imageGenerations.slice(0, 8).map((generation: any, index: number) => (
                                <motion.div
                                  key={generation.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="glass-effect rounded-lg p-4 hover:bg-slate-800/50 transition-all duration-200 group image-grid-item"
                                >
                                  <div className="flex items-start space-x-3">
                                    <motion.div 
                                      className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative"
                                      whileHover={{ scale: 1.05 }}
                                      onClick={() => setActiveTab('gallery')}
                                    >
                                      {generation.result?.data?.[0]?.url ? (
                                        <img
                                          src={generation.result.data[0].url}
                                          alt="Generated"
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                      )}
                                      {generation.result?.data?.[0]?.url && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg image-overlay">
                                          <Maximize2 className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-sm font-medium truncate">
                                          {generation.model.split('/')[1] || generation.model}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                          {imageSizes.find(s => s.id === generation.size)?.icon || "📐"}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate mb-2">
                                        {generation.prompt}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyPrompt(generation.prompt)}
                                            className="h-6 px-2 hover:bg-slate-600"
                                          >
                                            <Copy className="w-3 h-3" />
                                          </Button>
                                        </motion.div>
                                        {generation.result?.data?.[0]?.url && (
                                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => window.open(generation.result.data[0].url, '_blank')}
                                              className="h-6 px-2 hover:bg-slate-600"
                                            >
                                              <ExternalLink className="w-3 h-3" />
                                            </Button>
                                          </motion.div>
                                        )}
                                        <div className="ml-auto text-xs text-muted-foreground flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {new Date(generation.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {imageGenerations.length > 8 && (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setActiveTab('gallery')}
                              >
                                View All in Gallery ({imageGenerations.length})
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-6 h-6" />
                          <span>Image Gallery</span>
                          <Badge variant="secondary">
                            {imageGenerations.length} images
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/generations"] })}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generationsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-3">
                              <SkeletonLoader className="aspect-square rounded-lg" />
                              <SkeletonLoader className="h-4 w-3/4" />
                              <SkeletonLoader className="h-3 w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ImageGallery 
                          generations={generations || []} 
                          onImageAction={handleImageAction}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
