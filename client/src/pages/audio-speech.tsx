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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  Volume2, 
  Upload, 
  Download, 
  Play, 
  Pause,
  Loader2,
  FileAudio,
  Settings,
  Copy
} from "lucide-react";

const ttsModels = [
  { id: "provider-2/tts-1", name: "TTS-1", provider: "Provider 2", description: "Standard quality" },
  { id: "provider-2/tts-1-hd", name: "TTS-1 HD", provider: "Provider 2", description: "High definition" },
  { id: "provider-3/gemini-2.5-flash-preview-tts", name: "Gemini TTS", provider: "Provider 3", description: "Natural voice" },
  { id: "provider-2/gpt-4o-mini-tts", name: "GPT-4o Mini TTS", provider: "Provider 2", description: "Fast generation" },
  { id: "provider-6/sonic-2", name: "Sonic-2", provider: "Provider 6", description: "Premium quality" },
  { id: "provider-6/sonic", name: "Sonic", provider: "Provider 6", description: "Standard Sonic" },
];

const transcriptionModels = [
  { id: "provider-2/whisper-1", name: "Whisper-1", provider: "Provider 2", description: "Standard transcription" },
  { id: "provider-6/distil-whisper-large-v3-en", name: "Distil Whisper Large V3", provider: "Provider 6", description: "English optimized" },
  { id: "provider-2/gpt-4o-transcribe", name: "GPT-4o Transcribe", provider: "Provider 2", description: "Advanced transcription" },
  { id: "provider-2/gpt-4o-mini-transcribe", name: "GPT-4o Mini Transcribe", provider: "Provider 2", description: "Fast transcription" },
  { id: "provider-6/whisper-large-v3", name: "Whisper Large V3", provider: "Provider 6", description: "High accuracy" },
  { id: "provider-6/whisper-large-v3-turbo", name: "Whisper Large V3 Turbo", provider: "Provider 6", description: "Fast & accurate" },
];

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral" },
  { id: "echo", name: "Echo", description: "Male" },
  { id: "fable", name: "Fable", description: "British Male" },
  { id: "onyx", name: "Onyx", description: "Deep Male" },
  { id: "nova", name: "Nova", description: "Female" },
  { id: "shimmer", name: "Shimmer", description: "Soft Female" },
];

const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "it", name: "Italian" },
  { id: "pt", name: "Portuguese" },
  { id: "ru", name: "Russian" },
  { id: "ja", name: "Japanese" },
  { id: "ko", name: "Korean" },
  { id: "zh", name: "Chinese" },
];

export default function AudioSpeech() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // TTS State
  const [ttsText, setTtsText] = useState("");
  const [selectedTtsModel, setSelectedTtsModel] = useState(ttsModels[0].id);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  
  // Transcription State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTranscriptionModel, setSelectedTranscriptionModel] = useState(transcriptionModels[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

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

  const generateAudioMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/generate/audio", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Audio Generated Successfully",
        description: "Your speech has been generated and saved to your history.",
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
        description: error.message || "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const transcribeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transcription Complete",
        description: "Your audio has been transcribed successfully.",
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
        title: "Transcription Failed",
        description: error.message || "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: generations, isLoading: generationsLoading } = useQuery({
    queryKey: ["/api/generations"],
    enabled: isAuthenticated,
  });

  const handleGenerateAudio = () => {
    if (!ttsText.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to convert to speech.",
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

    generateAudioMutation.mutate({
      model: selectedTtsModel,
      input: ttsText,
      voice: selectedVoice,
      response_format: "mp3",
      speed: ttsSpeed,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTranscribe = () => {
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select an audio file to transcribe.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedFile);
    formData.append("model", selectedTranscriptionModel);
    formData.append("language", selectedLanguage);
    formData.append("response_format", "json");

    transcribeMutation.mutate(formData);
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      if (currentAudio === audioUrl && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentAudio(audioUrl);
        setIsPlaying(true);
      }
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const audioGenerations = generations?.filter((g: any) => g.type === "audio") || [];
  const transcriptionGenerations = generations?.filter((g: any) => g.type === "transcription") || [];

  return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Audio & Speech Tools</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Generate high-quality speech from text and transcribe audio with advanced AI models
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Tools */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="tts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger value="tts" className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Text to Speech</span>
                  </TabsTrigger>
                  <TabsTrigger value="transcription" className="flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span>Audio Transcription</span>
                  </TabsTrigger>
                </TabsList>

                {/* Text to Speech */}
                <TabsContent value="tts">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Volume2 className="w-6 h-6" />
                        <span>Text to Speech</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Text Input */}
                      <div className="space-y-2">
                        <Label htmlFor="ttsText">Text to Convert</Label>
                        <Textarea
                          id="ttsText"
                          placeholder="Enter the text you want to convert to speech..."
                          value={ttsText}
                          onChange={(e) => setTtsText(e.target.value)}
                          className="min-h-[120px] bg-slate-800/50 border-slate-700"
                        />
                      </div>

                      {/* Model and Voice Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ttsModel">AI Model</Label>
                          <Select value={selectedTtsModel} onValueChange={setSelectedTtsModel}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ttsModels.map((model) => (
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

                        <div className="space-y-2">
                          <Label htmlFor="voice">Voice</Label>
                          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {voices.map((voice) => (
                                <SelectItem key={voice.id} value={voice.id}>
                                  <div className="flex flex-col">
                                    <span>{voice.name}</span>
                                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Speed Control */}
                      <div className="space-y-2">
                        <Label htmlFor="speed">Speech Speed: {ttsSpeed}x</Label>
                        <Input
                          id="speed"
                          type="range"
                          min="0.25"
                          max="4.0"
                          step="0.25"
                          value={ttsSpeed}
                          onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>

                      <Separator />

                      <Button
                        onClick={handleGenerateAudio}
                        disabled={generateAudioMutation.isPending || !ttsText.trim()}
                        className="btn-primary w-full"
                        size="lg"
                      >
                        {generateAudioMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Speech...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5 mr-2" />
                            Generate Speech
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Audio Transcription */}
                <TabsContent value="transcription">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mic className="w-6 h-6" />
                        <span>Audio Transcription</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="audioFile">Audio File</Label>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose File</span>
                          </Button>
                          {selectedFile && (
                            <span className="text-sm text-muted-foreground">
                              {selectedFile.name}
                            </span>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: MP3, WAV, M4A, FLAC, WebM
                        </p>
                      </div>

                      {/* Model and Language Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transcriptionModel">AI Model</Label>
                          <Select value={selectedTranscriptionModel} onValueChange={setSelectedTranscriptionModel}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {transcriptionModels.map((model) => (
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

                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((language) => (
                                <SelectItem key={language.id} value={language.id}>
                                  {language.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <Button
                        onClick={handleTranscribe}
                        disabled={transcribeMutation.isPending || !selectedFile}
                        className="btn-primary w-full"
                        size="lg"
                      >
                        {transcribeMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Transcribe Audio
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Usage Indicator */}
              {user?.subscriptionType === "free" && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Free Plan Usage</span>
                    <span className="text-sm font-medium">
                      {user.generationsUsed} / {user.generationsLimit}
                    </span>
                  </div>
                  <Progress value={(user.generationsUsed / user.generationsLimit) * 100} className="h-2" />
                </div>
              )}
            </div>

            {/* Recent Generations */}
            <div className="lg:col-span-1">
              <Tabs defaultValue="audio" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger value="audio">Speech</TabsTrigger>
                  <TabsTrigger value="transcription">Transcripts</TabsTrigger>
                </TabsList>

                <TabsContent value="audio">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Volume2 className="w-5 h-5" />
                        <span>Recent Audio</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generationsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="loading-shimmer h-24 rounded-lg"></div>
                          ))}
                        </div>
                      ) : audioGenerations.length === 0 ? (
                        <div className="text-center py-8">
                          <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No audio generated yet</p>
                          <p className="text-sm text-muted-foreground">Your generated speech will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {audioGenerations.slice(0, 5).map((generation: any) => (
                            <div key={generation.id} className="glass-effect rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                                  <FileAudio className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {generation.model.split('/')[1] || generation.model}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {generation.prompt}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    {generation.result?.url && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => playAudio(generation.result.url)}
                                        className="h-6 px-2"
                                      >
                                        {currentAudio === generation.result.url && isPlaying ? (
                                          <Pause className="w-3 h-3" />
                                        ) : (
                                          <Play className="w-3 h-3" />
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyText(generation.prompt)}
                                      className="h-6 px-2"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transcription">
                  <Card className="glass-effect border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mic className="w-5 h-5" />
                        <span>Transcriptions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generationsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="loading-shimmer h-24 rounded-lg"></div>
                          ))}
                        </div>
                      ) : transcriptionGenerations.length === 0 ? (
                        <div className="text-center py-8">
                          <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No transcriptions yet</p>
                          <p className="text-sm text-muted-foreground">Your transcribed audio will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {transcriptionGenerations.slice(0, 5).map((generation: any) => (
                            <div key={generation.id} className="glass-effect rounded-lg p-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  {generation.model.split('/')[1] || generation.model}
                                </p>
                                {generation.result?.text && (
                                  <div className="text-xs text-muted-foreground p-2 bg-slate-800/50 rounded">
                                    {generation.result.text.substring(0, 100)}...
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyText(generation.result?.text || "")}
                                  className="h-6 px-2"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentAudio(null);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

    </div>
  );
}
