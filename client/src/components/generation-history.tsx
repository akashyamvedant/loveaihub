import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  Trash2
} from "lucide-react";

const typeIcons = {
  image: Image,
  video: Video,
  chat: MessageSquare,
  audio: Mic,
  transcription: Mic,
  image_edit: Edit,
};

const typeColors = {
  image: "bg-primary/20 text-primary",
  video: "bg-cyan-500/20 text-cyan-400",
  chat: "bg-purple-500/20 text-purple-400",
  audio: "bg-emerald-500/20 text-emerald-400",
  transcription: "bg-orange-500/20 text-orange-400",
  image_edit: "bg-pink-500/20 text-pink-400",
};

export default function GenerationHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: generations, isLoading } = useQuery({
    queryKey: ["/api/generations"],
    retry: false,
  });

  const filteredGenerations = generations?.filter((generation: any) => {
    const matchesSearch = generation.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         generation.model?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || generation.type === selectedType;
    const matchesStatus = selectedStatus === "all" || generation.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResult = (generation: any) => {
    if (generation.result?.data?.[0]?.url) {
      window.open(generation.result.data[0].url, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: "secondary" as const, color: "text-green-400", text: "Completed" },
      pending: { variant: "outline" as const, color: "text-yellow-400", text: "Pending" },
      failed: { variant: "destructive" as const, color: "text-red-400", text: "Failed" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const groupedGenerations = filteredGenerations.reduce((acc: any, generation: any) => {
    const date = new Date(generation.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(generation);
    return acc;
  }, {});

  return (
    <Card className="glass-effect border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-6 h-6" />
          <span>Generation History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search generations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[160px] bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="transcription">Transcription</SelectItem>
                <SelectItem value="image_edit">Image Edits</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[160px] bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generation List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-24 rounded-lg"></div>
            ))}
          </div>
        ) : filteredGenerations.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No generations found</h3>
            <p className="text-muted-foreground">
              {generations?.length === 0 
                ? "Start creating with our AI tools to see your history here" 
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {Object.entries(groupedGenerations).map(([date, dayGenerations]: [string, any]) => (
              <div key={date}>
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {dayGenerations.map((generation: any) => {
                    const TypeIcon = typeIcons[generation.type as keyof typeof typeIcons] || Image;
                    const statusBadge = getStatusBadge(generation.status);
                    
                    return (
                      <div key={generation.id} className="glass-effect rounded-lg p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start space-x-4">
                          {/* Type Icon */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            typeColors[generation.type as keyof typeof typeColors] || "bg-slate-700"
                          }`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium truncate">
                                {generation.model?.split('/')[1] || generation.model}
                              </h4>
                              <Badge variant={statusBadge.variant} className="text-xs">
                                {statusBadge.text}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {generation.prompt || "No prompt provided"}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(generation.createdAt)}</span>
                              </div>
                              {generation.metadata?.options && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{generation.metadata.options.size || "Standard"}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(generation.prompt || "")}
                                className="h-8 px-2"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                              
                              {generation.result?.data?.[0]?.url && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(generation.result.data[0].url, '_blank')}
                                    className="h-8 px-2"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadResult(generation)}
                                    className="h-8 px-2"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </>
                              )}

                              {generation.result?.text && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(generation.result.text)}
                                  className="h-8 px-2"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Text
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Preview */}
                          {generation.result?.data?.[0]?.url && (
                            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {generation.type === "image" || generation.type === "image_edit" ? (
                                <img
                                  src={generation.result.data[0].url}
                                  alt="Generated"
                                  className="w-full h-full object-cover"
                                />
                              ) : generation.type === "video" ? (
                                <video
                                  className="w-full h-full object-cover"
                                  poster="/placeholder-video.jpg"
                                >
                                  <source src={generation.result.data[0].url} type="video/mp4" />
                                </video>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <TypeIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
