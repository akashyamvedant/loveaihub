import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  Sparkles,
  RotateCcw,
  Edit3,
  Share,
  Download,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Menu,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Code,
  Zap,
  Globe,
  Shield,
  Clock,
  MoreHorizontal,
  ChevronDown,
  X,
  Check,
  ArrowUp,
  PlusCircle,
  History,
  Bookmark,
  Star,
  MessageCircle,
  Maximize2,
  Minimize2
} from "lucide-react";

const chatModels = [
  { 
    id: "provider-6/gpt-4.1-mini", 
    name: "GPT-4.1 Mini", 
    provider: "OpenAI",
    category: "Fast",
    description: "Quick responses for everyday tasks",
    capabilities: ["Fast responses", "General knowledge", "Code assistance"],
    icon: "🚀",
    color: "bg-blue-500"
  },
  { 
    id: "provider-6/gpt-4.1", 
    name: "GPT-4.1", 
    provider: "OpenAI",
    category: "Advanced",
    description: "Most capable model for complex reasoning",
    capabilities: ["Advanced reasoning", "Complex analysis", "Creative writing"],
    icon: "🧠",
    color: "bg-purple-500"
  },
  { 
    id: "provider-6/claude-sonnet-4-20250514", 
    name: "Claude Sonnet 4", 
    provider: "Anthropic",
    category: "Balanced",
    description: "Excellent for analysis and thoughtful responses",
    capabilities: ["Thoughtful analysis", "Safety focused", "Long conversations"],
    icon: "🎭",
    color: "bg-orange-500"
  },
  { 
    id: "provider-6/gpt-4o-search-preview", 
    name: "GPT-4o Search", 
    provider: "OpenAI",
    category: "Search",
    description: "Real-time web search and current information",
    capabilities: ["Web search", "Current events", "Real-time data"],
    icon: "🔍",
    color: "bg-green-500"
  },
  { 
    id: "provider-6/gemini-2.5-pro-preview-05-06", 
    name: "Gemini 2.5 Pro", 
    provider: "Google",
    category: "Multimodal",
    description: "Advanced multimodal understanding",
    capabilities: ["Vision", "Multimodal", "Large context"],
    icon: "💎",
    color: "bg-cyan-500"
  },
  { 
    id: "provider-2/deepseek-r1-0528", 
    name: "DeepSeek R1", 
    provider: "DeepSeek",
    category: "Reasoning",
    description: "Strong mathematical and logical reasoning",
    capabilities: ["Mathematical reasoning", "Code generation", "Problem solving"],
    icon: "🤖",
    color: "bg-indigo-500"
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  isStreaming?: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
  isEdited?: boolean;
  originalContent?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
  model: string;
  pinned?: boolean;
}

export default function AiChat() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(chatModels[0].id);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showConversations, setShowConversations] = useState(false);
  
  // Settings
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2000]);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [enableVision, setEnableVision] = useState(false);
  
  // Voice and attachments
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "👋 Hello! I'm your AI assistant. I can help you with a wide variety of tasks including:\n\n• **Research & Analysis** - Deep dive into any topic\n• **Creative Writing** - Stories, poems, scripts, and more\n• **Code & Programming** - Debug, write, and explain code\n• **Problem Solving** - Break down complex challenges\n• **Learning & Education** - Explain concepts and tutor\n• **Planning & Strategy** - Organize thoughts and make plans\n\nWhat would you like to explore today? 🚀",
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const currentModel = chatModels.find(m => m.id === selectedModel);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access AI Chat",
        variant: "destructive",
      });
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
      setIsTyping(false);
      setStreamingMessage("");
      
      // Auto-scroll to bottom
      setTimeout(scrollToBottom, 100);
    },
    onError: (error) => {
      setIsTyping(false);
      setStreamingMessage("");
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);
    
    // Resize textarea back to normal
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const chatMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestData = {
      model: selectedModel,
      messages: chatMessages,
      temperature: temperature[0],
      max_tokens: maxTokens[0],
      stream: false,
    };

    if (systemPrompt.trim()) {
      requestData.messages.unshift({
        role: "system",
        content: systemPrompt.trim()
      });
    }

    chatMutation.mutate(requestData);
  }, [currentMessage, attachedFiles, messages, selectedModel, temperature, maxTokens, systemPrompt, chatMutation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
  };

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  }, [toast]);

  const regenerateResponse = useCallback((messageIndex: number) => {
    if (messageIndex === 0) return; // Don't regenerate first message
    
    // Remove messages after the selected one
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    
    // Regenerate from the last user message
    const lastUserMessage = messagesToKeep[messagesToKeep.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      setIsTyping(true);
      
      const chatMessages = messagesToKeep.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      chatMutation.mutate({
        model: selectedModel,
        messages: chatMessages,
        temperature: temperature[0],
        max_tokens: maxTokens[0],
      });
    }
  }, [messages, selectedModel, temperature, maxTokens, chatMutation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    // Add welcome message after clearing
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Chat cleared! How can I help you today? 🚀",
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages([welcomeMessage]);
    }, 100);
  }, [selectedModel]);

  const startNewConversation = () => {
    clearChat();
    setCurrentConversationId(null);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const MessageBubble = ({ message, index }: { message: Message; index: number }) => (
    <div className={`group flex gap-4 p-6 hover:bg-slate-800/30 transition-all duration-300 hover:scale-[1.01] ${
      message.role === "user" ? "bg-slate-800/10" : ""
    } animate-in fade-in-0 slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={`w-10 h-10 transition-all duration-300 ${
          message.role === "assistant"
            ? "ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25 hover:ring-purple-400/70 hover:shadow-purple-400/30"
            : "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25 hover:ring-blue-400/70 hover:shadow-blue-400/30"
        }`}>
          <AvatarFallback className={
            message.role === "user"
              ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-inner"
              : "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white shadow-inner"
          }>
            {message.role === "user" ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </AvatarFallback>
          {user?.profileImageUrl && message.role === "user" && (
            <AvatarImage src={user.profileImageUrl} />
          )}
        </Avatar>
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-300">
            {message.role === "user" ? (user?.firstName || "You") : "AI Assistant"}
          </span>
          {message.model && (
            <Badge variant="outline" className="text-xs h-5 px-2">
              {currentModel?.icon} {currentModel?.name}
            </Badge>
          )}
          <span className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div className={`prose prose-sm max-w-none ${
          message.role === "user" 
            ? "prose-invert text-slate-200" 
            : "prose-invert text-slate-100"
        }`}>
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </div>
        </div>
        
        {/* Message Actions */}
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-700"
                  onClick={() => copyMessage(message.content)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {message.role === "assistant" && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-700"
                      onClick={() => regenerateResponse(index + 1)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Regenerate response</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-700"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Good response</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-700"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Poor response</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-700"
                >
                  <Share className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ${
      isFullscreen ? "fixed inset-0 z-50" : ""
    }`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {!isFullscreen && <Navigation />}
      
      <div className={`${!isFullscreen ? "pt-20" : ""} h-screen flex flex-col`}>
        {/* Chat Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold">AI Chat</h1>
                </div>
                
                {currentModel && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
                    <span className="text-lg">{currentModel.icon}</span>
                    <span className="text-sm font-medium">{currentModel.name}</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {currentModel.category}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                
                <Sheet open={showSettings} onOpenChange={setShowSettings}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-96 bg-slate-900 border-slate-800">
                    <SheetHeader>
                      <SheetTitle className="text-white">Chat Settings</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-6 mt-6">
                      {/* Model Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">AI Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {chatModels.map((model) => (
                              <SelectItem key={model.id} value={model.id} className="focus:bg-slate-700">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{model.icon}</span>
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-xs text-slate-400">{model.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Temperature */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">Temperature</Label>
                          <span className="text-sm text-slate-400">{temperature[0]}</span>
                        </div>
                        <Slider
                          value={temperature}
                          onValueChange={setTemperature}
                          max={2}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-500">
                          Controls randomness. Higher = more creative, Lower = more focused
                        </p>
                      </div>

                      {/* Max Tokens */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">Max Tokens</Label>
                          <span className="text-sm text-slate-400">{maxTokens[0]}</span>
                        </div>
                        <Slider
                          value={maxTokens}
                          onValueChange={setMaxTokens}
                          max={4000}
                          min={100}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      {/* System Prompt */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">System Prompt</Label>
                        <Textarea
                          placeholder="Set custom instructions for the AI..."
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="bg-slate-800 border-slate-700 min-h-[80px] resize-none"
                        />
                      </div>

                      <Separator className="bg-slate-700" />

                      {/* Features */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Features</Label>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm">Web Search</Label>
                            <p className="text-xs text-slate-500">Enable real-time web search</p>
                          </div>
                          <Switch 
                            checked={enableWebSearch} 
                            onCheckedChange={setEnableWebSearch}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm">Vision</Label>
                            <p className="text-xs text-slate-500">Enable image understanding</p>
                          </div>
                          <Switch 
                            checked={enableVision} 
                            onCheckedChange={setEnableVision}
                          />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewConversation}
                >
                  <Plus className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
              <div className="py-4">
                {messages.map((message, index) => (
                  <MessageBubble key={message.id} message={message} index={index} />
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-4 p-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <Avatar className="w-10 h-10 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/25">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white shadow-inner">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-700/50">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-sm text-slate-300 font-medium">AI is crafting a response...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-800/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto p-6">
            <div className="relative">
              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => setAttachedFiles(files => files.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="relative flex items-end gap-3 bg-slate-800/50 rounded-2xl border border-slate-700 focus-within:border-purple-500/50 transition-all">
                <div className="flex-1 p-4">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Message AI... (Press Enter to send, Shift+Enter for new line)"
                    value={currentMessage}
                    onChange={handleTextareaChange}
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending}
                    className="min-h-[24px] max-h-[200px] resize-none bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-slate-500"
                    style={{ height: 'auto' }}
                  />
                </div>
                
                {/* Input Actions */}
                <div className="flex items-center gap-1 p-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voice input</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={chatMutation.isPending || (!currentMessage.trim() && attachedFiles.length === 0)}
                    className="h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Input Footer */}
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span>Model: {currentModel?.name}</span>
                  {user && (
                    <span>
                      {user.generationsUsed || 0}/{user.generationsLimit === -1 ? '∞' : user.generationsLimit || 50} messages used
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {enableWebSearch && (
                    <Badge variant="secondary" className="text-xs h-5 bg-green-500/20 text-green-400">
                      <Search className="w-3 h-3 mr-1" />
                      Web Search
                    </Badge>
                  )}
                  {enableVision && (
                    <Badge variant="secondary" className="text-xs h-5 bg-blue-500/20 text-blue-400">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Vision
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isFullscreen && <Footer />}
    </div>
  );
}
