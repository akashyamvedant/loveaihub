import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Volume2, 
  FileAudio, 
  Mic,
  Upload,
  Download, 
  Play,
  Pause,
  Loader2,
  Settings
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AudioToolsProps {
  type: 'tts' | 'transcription';
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
    voices?: string[];
    languages?: string[];
  }>;
}

export default function AudioTools({ type, selectedModel, onModelChange, models }: AudioToolsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // TTS States
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Transcription States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [transcriptionResult, setTranscriptionResult] = useState<string>("");

  const currentModel = models.find(m => m.id === selectedModel);

  // TTS Mutation
  const ttsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/audio/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.result?.url) {
        setGeneratedAudio(data.result.url);
      }
      toast({
        title: "Audio generated successfully!",
        description: "Your text has been converted to speech",
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
        description: error.message || "Failed to generate audio",
        variant: "destructive",
      });
    },
  });

  // Transcription Mutation
  const transcriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('model', data.model);
      if (data.language) {
        formData.append('language', data.language);
      }

      const response = await fetch('/api/ai/audio/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setTranscriptionResult(data.result?.text || data.text || "No transcription available");
      toast({
        title: "Transcription completed!",
        description: "Your audio has been transcribed successfully",
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
        title: "Transcription failed",
        description: error.message || "Failed to transcribe audio",
        variant: "destructive",
      });
    },
  });

  const handleTTSGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to convert to speech",
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

    ttsMutation.mutate({
      model: selectedModel,
      input: text.trim(),
      voice: selectedVoice,
    });
  };

  const handleTranscribe = () => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select an audio file to transcribe",
        variant: "destructive",
      });
      return;
    }

    if (user?.subscriptionTier === 'free' && user.generationsUsed >= user.generationsLimit) {
      toast({
        title: "Generation limit reached",
        description: "Upgrade to Premium for unlimited transcriptions",
        variant: "destructive",
      });
      return;
    }

    transcriptionMutation.mutate({
      model: selectedModel,
      file: selectedFile,
      language: selectedLanguage !== 'auto' ? selectedLanguage : undefined,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select an MP3, WAV, M4A, FLAC, or OGG file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTranscription = () => {
    navigator.clipboard.writeText(transcriptionResult);
    toast({
      title: "Copied to clipboard",
      description: "Transcription copied successfully",
    });
  };

  if (type === 'tts') {
    return (
      <div className="space-y-6">
        {/* TTS Form */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Text-to-Speech
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label>TTS Model</Label>
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

            {/* Voice Selection */}
            {currentModel?.voices && (
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentModel.voices.map((voice) => (
                      <SelectItem key={voice} value={voice}>
                        {voice.charAt(0).toUpperCase() + voice.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Text Input */}
            <div className="space-y-2">
              <Label>Text to Convert</Label>
              <Textarea
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Character count: {text.length} (max 4000)
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleTTSGenerate}
              disabled={ttsMutation.isPending || !text.trim()}
              className="w-full btn-depth"
              size="lg"
            >
              {ttsMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Audio...
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

        {/* Generated Audio */}
        {generatedAudio && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5" />
                Generated Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAudio(generatedAudio, 'generated-speech.mp3')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <audio
                  ref={audioRef}
                  src={generatedAudio}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Transcription UI
  return (
    <div className="space-y-6">
      {/* Transcription Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="w-5 h-5" />
            Audio Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Transcription Model</Label>
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

          {/* Language Selection */}
          {currentModel?.languages && (
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {currentModel.languages.filter(lang => lang !== 'auto').map((language) => (
                    <SelectItem key={language} value={language}>
                      {language.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-2">Click to upload audio file</p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, M4A, FLAC, OGG (max 25MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Transcribe Button */}
          <Button
            onClick={handleTranscribe}
            disabled={transcriptionMutation.isPending || !selectedFile}
            className="w-full btn-depth"
            size="lg"
          >
            {transcriptionMutation.isPending ? (
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

      {/* Transcription Result */}
      {transcriptionResult && (
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5" />
                Transcription Result
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTranscription}
              >
                Copy Text
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{transcriptionResult}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
