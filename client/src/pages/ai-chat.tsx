import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Copy,
  Trash2,
  Settings,
  Search,
  Brain,
  Sparkles
} from "lucide-react";

const chatModels = [
  { id: "provider-6/gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "Provider 6" },
  { id: "provider-3/gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "Provider 3" },
  { id: "provider-6/gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "Provider 6" },
  { id: "provider-6/gpt-4o-search-preview", name: "GPT-4o Search Preview", provider: "Provider 6" },
  { id: "provider-3/gpt-4o-search-preview", name: "GPT-4o Search Preview", provider: "Provider 3" },
  { id: "provider-6/gpt-4.1", name: "GPT-4.1", provider: "Provider 6" },
  { id: "provider-2/gpt-4.1", name: "GPT-4.1", provider: "Provider 2" },
  { id: "provider-3/gpt-4.1", name: "GPT-4.1", provider: "Provider 3" },
  { id: "provider-6/claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "Provider 6" },
  { id: "provider-3/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Provider 3" },
  { id: "provider-6/gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro", provider: "Provider 6" },
  { id: "provider-1/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Provider 1" },
  { id: "provider-2/deepseek-r1-0528", name: "DeepSeek R1", provider: "Provider 2" },
  { id: "provider-3/deepseek-r1-0528", name: "DeepSeek R1", provider: "Provider 3" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AiChat() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(chatModels[0].id);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [showSettings, setShowSettings] = useState(false);

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

  const chatMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/chat/completions", data);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date(),
        model: variables.model,
      };
      setMessages(prev => [...prev, assistantMessage]);
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
        title: "Chat Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    const chatMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    chatMutation.mutate({
      model: selectedModel,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
    });

    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard.",
    });
  };

  const clearMessages = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared.",
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Advanced AI Chat</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Chat with the most advanced AI models with web search and analysis capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chatModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.provider}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                    <Input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="bg-slate-800/50 border-slate-700"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values make output more random
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="100"
                      max="4000"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
                      className="bg-slate-800/50 border-slate-700"
                    />
                  </div>

                  <Separator />

                  {/* Model Features */}
                  <div className="space-y-2">
                    <Label>Model Features</Label>
                    <div className="space-y-1">
                      {selectedModel.includes("search") && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Search className="w-3 h-3" />
                          <span>Web Search</span>
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Brain className="w-3 h-3" />
                        <span>Advanced Reasoning</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Creative Writing</span>
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={clearMessages}
                    variant="outline"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="glass-effect border-border h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Chat with AI</span>
                    <Badge variant="outline" className="ml-auto">
                      {selectedModel.split('/')[1] || selectedModel}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Start a conversation</p>
                        <p className="text-sm text-muted-foreground">
                          Ask me anything! I can help with research, analysis, creative writing, and more.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              message.role === "user" ? "justify-end" : ""
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "glass-effect"
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{message.content}</div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyMessage(message.content)}
                                  className="h-6 px-2 opacity-70 hover:opacity-100"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {message.role === "user" && (
                              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {chatMutation.isPending && (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="glass-effect rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="mt-4 flex items-end space-x-2">
                    <Textarea
                      placeholder="Type your message... (Shift+Enter for new line)"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={chatMutation.isPending}
                      className="flex-1 min-h-[60px] max-h-[120px] bg-slate-800/50 border-slate-700 resize-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={chatMutation.isPending || !currentMessage.trim()}
                      className="btn-primary"
                      size="lg"
                    >
                      {chatMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
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
