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
import { BackButton } from "@/components/ui/back-button";
import { AppSidebar } from "@/components/ui/app-sidebar";
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
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Archive,
  Pin,
  Filter,
  SortDesc,
  Eye,
  EyeOff
} from "lucide-react";

const chatModels = [
  // === GPT-5 Series (Latest) ===
  {
    id: "provider-3/gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    category: "Next-Gen",
    description: "The most advanced GPT model with unprecedented capabilities",
    capabilities: ["Next-gen reasoning", "Advanced multimodal", "Creative excellence"],
    icon: "⭐",
    color: "bg-yellow-500",
    tier: "premium"
  },
  {
    id: "provider-3/gpt-5-chat",
    name: "GPT-5 Chat",
    provider: "OpenAI",
    category: "Next-Gen",
    description: "GPT-5 optimized for conversational interactions",
    capabilities: ["Advanced dialogue", "Context awareness", "Personality"],
    icon: "💫",
    color: "bg-yellow-500",
    tier: "premium"
  },
  {
    id: "provider-3/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    category: "Fast",
    description: "Lightweight GPT-5 for quick responses",
    capabilities: ["Ultra-fast", "Efficient", "GPT-5 quality"],
    icon: "⚡",
    color: "bg-yellow-400",
    tier: "standard"
  },
  {
    id: "provider-3/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "OpenAI",
    category: "Ultra-Fast",
    description: "Smallest GPT-5 variant for instant responses",
    capabilities: ["Instant responses", "Minimal latency", "Basic tasks"],
    icon: "🚀",
    color: "bg-yellow-300",
    tier: "free"
  },

  // === O-Series (Reasoning) ===
  {
    id: "provider-2/o3",
    name: "O3",
    provider: "OpenAI",
    category: "Reasoning",
    description: "Advanced reasoning model for complex problems",
    capabilities: ["Deep reasoning", "Problem solving", "Mathematical thinking"],
    icon: "🎯",
    color: "bg-emerald-500",
    tier: "premium"
  },
  {
    id: "provider-6/o3-medium",
    name: "O3 Medium",
    provider: "OpenAI",
    category: "Reasoning",
    description: "Balanced reasoning model",
    capabilities: ["Moderate reasoning", "Good performance", "Versatile"],
    icon: "🎯",
    color: "bg-emerald-400",
    tier: "standard"
  },
  {
    id: "provider-6/o3-pro",
    name: "O3 Pro",
    provider: "OpenAI",
    category: "Reasoning",
    description: "Professional-grade reasoning capabilities",
    capabilities: ["Professional reasoning", "Complex analysis", "High accuracy"],
    icon: "🎯",
    color: "bg-emerald-600",
    tier: "premium"
  },
  {
    id: "provider-3/o3-mini",
    name: "O3 Mini",
    provider: "OpenAI",
    category: "Reasoning",
    description: "Compact reasoning model",
    capabilities: ["Basic reasoning", "Fast responses", "Efficient"],
    icon: "🎯",
    color: "bg-emerald-300",
    tier: "free"
  },
  {
    id: "provider-2/o4-mini",
    name: "O4 Mini",
    provider: "OpenAI",
    category: "Next-Gen Reasoning",
    description: "Next generation compact reasoning model",
    capabilities: ["Advanced reasoning", "Compact size", "Future tech"],
    icon: "🎯",
    color: "bg-teal-500",
    tier: "premium"
  },

  // === GPT-4.1 Series ===
  {
    id: "provider-6/gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    category: "Advanced",
    description: "Most capable GPT-4 variant for complex tasks",
    capabilities: ["Advanced reasoning", "Complex analysis", "Creative writing"],
    icon: "🧠",
    color: "bg-blue-500",
    tier: "premium"
  },
  {
    id: "provider-6/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    category: "Fast",
    description: "Quick responses for everyday tasks",
    capabilities: ["Fast responses", "General knowledge", "Code assistance"],
    icon: "🚀",
    color: "bg-blue-400",
    tier: "standard"
  },
  {
    id: "provider-6/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "OpenAI",
    category: "Ultra-Fast",
    description: "Ultra-compact GPT-4.1 for instant responses",
    capabilities: ["Instant responses", "Minimal resources", "Basic tasks"],
    icon: "⚡",
    color: "bg-blue-300",
    tier: "free"
  },
  {
    id: "provider-3/gpt-4.5-preview",
    name: "GPT-4.5 Preview",
    provider: "OpenAI",
    category: "Preview",
    description: "Preview of next-generation GPT capabilities",
    capabilities: ["Cutting-edge features", "Experimental", "Future preview"],
    icon: "🔮",
    color: "bg-indigo-500",
    tier: "premium"
  },

  // === GPT-4o Series (Search & Vision) ===
  {
    id: "provider-6/gpt-4o-search-preview",
    name: "GPT-4o Search",
    provider: "OpenAI",
    category: "Search",
    description: "Real-time web search and current information",
    capabilities: ["Web search", "Current events", "Real-time data"],
    icon: "🔍",
    color: "bg-green-500",
    tier: "premium"
  },
  {
    id: "provider-6/gpt-4o-mini-search-preview",
    name: "GPT-4o Mini Search",
    provider: "OpenAI",
    category: "Search",
    description: "Compact search-enabled model",
    capabilities: ["Web search", "Fast responses", "Current info"],
    icon: "🔍",
    color: "bg-green-400",
    tier: "standard"
  },

  // === Claude Series ===
  {
    id: "provider-6/claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    category: "Balanced",
    description: "Latest Claude with excellent reasoning and safety",
    capabilities: ["Thoughtful analysis", "Safety focused", "Long conversations"],
    icon: "🎭",
    color: "bg-orange-500",
    tier: "premium"
  },
  {
    id: "provider-6/claude-sonnet-4-20250514-thinking",
    name: "Claude Sonnet 4 Thinking",
    provider: "Anthropic",
    category: "Reasoning",
    description: "Claude with visible thinking process",
    capabilities: ["Transparent reasoning", "Step-by-step thinking", "Detailed analysis"],
    icon: "🧠",
    color: "bg-orange-600",
    tier: "premium"
  },

  // === Gemini Series ===
  {
    id: "provider-6/gemini-2.5-pro-preview-05-06",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "Multimodal",
    description: "Advanced multimodal understanding with 2M context",
    capabilities: ["Vision", "Multimodal", "Large context", "Code understanding"],
    icon: "💎",
    color: "bg-cyan-500",
    tier: "premium"
  },
  {
    id: "provider-1/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "Multimodal",
    description: "Google's flagship multimodal AI model",
    capabilities: ["Multimodal AI", "Code generation", "Creative tasks"],
    icon: "💎",
    color: "bg-cyan-400",
    tier: "premium"
  },

  // === LLaMA Series ===
  {
    id: "provider-2/llama-4-maverick",
    name: "LLaMA 4 Maverick",
    provider: "Meta",
    category: "Open Source",
    description: "Latest LLaMA with maverick capabilities",
    capabilities: ["Open source", "High performance", "Versatile"],
    icon: "🦙",
    color: "bg-purple-500",
    tier: "standard"
  },
  {
    id: "provider-2/llama-4-scout",
    name: "LLaMA 4 Scout",
    provider: "Meta",
    category: "Exploration",
    description: "LLaMA optimized for exploration and discovery",
    capabilities: ["Exploration", "Discovery", "Research"],
    icon: "🔍",
    color: "bg-purple-400",
    tier: "standard"
  },
  {
    id: "provider-1/llama-3.3-70B-instruct-turbo",
    name: "LLaMA 3.3 70B Turbo",
    provider: "Meta",
    category: "High Performance",
    description: "Turbo-charged LLaMA for fast, high-quality responses",
    capabilities: ["High performance", "Fast inference", "Quality responses"],
    icon: "🦙",
    color: "bg-purple-600",
    tier: "standard"
  },
  {
    id: "provider-1/llama-3.1-405b-instruct-turbo",
    name: "LLaMA 3.1 405B Turbo",
    provider: "Meta",
    category: "Ultra Large",
    description: "Massive LLaMA model with exceptional capabilities",
    capabilities: ["Massive scale", "Exceptional quality", "Complex reasoning"],
    icon: "🦙",
    color: "bg-purple-700",
    tier: "premium"
  },

  // === DeepSeek Series ===
  {
    id: "provider-2/deepseek-r1-0528",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "Reasoning",
    description: "Advanced reasoning model with strong analytical capabilities",
    capabilities: ["Mathematical reasoning", "Code generation", "Problem solving"],
    icon: "🤖",
    color: "bg-indigo-500",
    tier: "premium"
  },
  {
    id: "provider-1/deepseek-r1-0528",
    name: "DeepSeek R1 Alt",
    provider: "DeepSeek",
    category: "Reasoning",
    description: "Alternative DeepSeek R1 deployment",
    capabilities: ["Mathematical reasoning", "Logic", "Analysis"],
    icon: "🤖",
    color: "bg-indigo-400",
    tier: "premium"
  },
  {
    id: "provider-6/deepseek-r1-uncensored",
    name: "DeepSeek R1 Uncensored",
    provider: "DeepSeek",
    category: "Uncensored",
    description: "DeepSeek R1 with reduced content filtering",
    capabilities: ["Uncensored", "Raw responses", "Unfiltered"],
    icon: "🔓",
    color: "bg-red-500",
    tier: "premium"
  },
  {
    id: "provider-3/deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    category: "Latest",
    description: "Latest DeepSeek model with enhanced capabilities",
    capabilities: ["Enhanced performance", "Improved reasoning", "Better quality"],
    icon: "🤖",
    color: "bg-indigo-600",
    tier: "premium"
  },

  // === Mistral Series ===
  {
    id: "provider-2/mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    category: "Large Model",
    description: "Mistral's flagship large language model",
    capabilities: ["Large scale", "High quality", "Multilingual"],
    icon: "🌪️",
    color: "bg-red-500",
    tier: "premium"
  },
  {
    id: "provider-2/mistral-small",
    name: "Mistral Small",
    provider: "Mistral AI",
    category: "Efficient",
    description: "Compact Mistral model for efficient processing",
    capabilities: ["Efficient", "Fast responses", "Good quality"],
    icon: "🌪️",
    color: "bg-red-400",
    tier: "standard"
  },
  {
    id: "provider-2/mistral-saba",
    name: "Mistral Saba",
    provider: "Mistral AI",
    category: "Specialized",
    description: "Specialized Mistral variant",
    capabilities: ["Specialized tasks", "Optimized performance", "Focused"],
    icon: "🌪️",
    color: "bg-red-600",
    tier: "premium"
  },

  // === Qwen Series ===
  {
    id: "provider-3/qwen-3-235B-a22b-2507",
    name: "Qwen 3 235B",
    provider: "Alibaba",
    category: "Large Scale",
    description: "Massive Qwen model with 235B parameters",
    capabilities: ["Massive scale", "Multilingual", "High performance"],
    icon: "🈶",
    color: "bg-amber-500",
    tier: "premium"
  },
  {
    id: "provider-6/qwen3-coder-480b-a35b",
    name: "Qwen 3 Coder 480B",
    provider: "Alibaba",
    category: "Coding",
    description: "Ultra-large Qwen specialized for coding",
    capabilities: ["Code generation", "Programming", "Software development"],
    icon: "💻",
    color: "bg-amber-600",
    tier: "premium"
  },
  {
    id: "provider-3/qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    provider: "Alibaba",
    category: "Coding",
    description: "Qwen optimized for programming tasks",
    capabilities: ["Code assistance", "Programming help", "Development"],
    icon: "💻",
    color: "bg-amber-400",
    tier: "standard"
  },
  {
    id: "provider-2/qwq-32b",
    name: "QwQ 32B",
    provider: "Alibaba",
    category: "Reasoning",
    description: "Qwen variant focused on questioning and reasoning",
    capabilities: ["Question answering", "Reasoning", "Analysis"],
    icon: "❓",
    color: "bg-amber-300",
    tier: "standard"
  },

  // === Specialized Models ===
  {
    id: "provider-2/codestral",
    name: "Codestral",
    provider: "Mistral AI",
    category: "Coding",
    description: "Mistral's specialized coding model",
    capabilities: ["Code generation", "Programming", "Debug assistance"],
    icon: "💻",
    color: "bg-violet-500",
    tier: "standard"
  },
  {
    id: "provider-2/pixtral-large",
    name: "Pixtral Large",
    provider: "Mistral AI",
    category: "Vision",
    description: "Large vision-language model from Mistral",
    capabilities: ["Vision understanding", "Image analysis", "Multimodal"],
    icon: "👁️",
    color: "bg-pink-500",
    tier: "premium"
  },
  {
    id: "provider-3/pixtral-12b-2409",
    name: "Pixtral 12B",
    provider: "Mistral AI",
    category: "Vision",
    description: "Compact vision model for image understanding",
    capabilities: ["Image understanding", "Visual Q&A", "Compact"],
    icon: "👁️",
    color: "bg-pink-400",
    tier: "standard"
  },

  // === Chinese Models ===
  {
    id: "provider-6/kimi-k2",
    name: "Kimi K2",
    provider: "Moonshot AI",
    category: "Chinese",
    description: "Advanced Chinese language model",
    capabilities: ["Chinese language", "Cultural context", "Local knowledge"],
    icon: "🀄",
    color: "bg-rose-500",
    tier: "premium"
  },
  {
    id: "provider-6/minimax-m1-40k",
    name: "MiniMax M1 40K",
    provider: "MiniMax",
    category: "Long Context",
    description: "Model with 40K context window",
    capabilities: ["Long context", "Document analysis", "Extended memory"],
    icon: "📄",
    color: "bg-sky-500",
    tier: "premium"
  },
  {
    id: "provider-6/minimax-text-01",
    name: "MiniMax Text 01",
    provider: "MiniMax",
    category: "Text",
    description: "Specialized text processing model",
    capabilities: ["Text processing", "Language tasks", "Writing"],
    icon: "📝",
    color: "bg-sky-400",
    tier: "standard"
  },

  // === Search & Reasoning Specialized ===
  {
    id: "provider-1/sonar",
    name: "Sonar",
    provider: "Perplexity",
    category: "Search",
    description: "Advanced search and research capabilities",
    capabilities: ["Web search", "Research", "Information gathering"],
    icon: "🔍",
    color: "bg-green-600",
    tier: "premium"
  },
  {
    id: "provider-1/sonar-pro",
    name: "Sonar Pro",
    provider: "Perplexity",
    category: "Search Pro",
    description: "Professional-grade search and analysis",
    capabilities: ["Advanced search", "Professional research", "Deep analysis"],
    icon: "🔍",
    color: "bg-green-700",
    tier: "premium"
  },
  {
    id: "provider-1/sonar-reasoning",
    name: "Sonar Reasoning",
    provider: "Perplexity",
    category: "Search + Reasoning",
    description: "Search combined with advanced reasoning",
    capabilities: ["Search + reasoning", "Complex analysis", "Multi-step thinking"],
    icon: "🧠",
    color: "bg-green-800",
    tier: "premium"
  },

  // === Experimental & Cutting Edge ===
  {
    id: "provider-3/grok-4-0709",
    name: "Grok 4",
    provider: "xAI",
    category: "Experimental",
    description: "Cutting-edge AI with unique personality",
    capabilities: ["Unique personality", "Experimental features", "Creative responses"],
    icon: "🚀",
    color: "bg-gray-500",
    tier: "premium"
  },
  {
    id: "provider-6/r1-1776",
    name: "R1-1776",
    provider: "Unknown",
    category: "Experimental",
    description: "Experimental reasoning model",
    capabilities: ["Experimental", "Advanced reasoning", "Cutting-edge"],
    icon: "⚗️",
    color: "bg-slate-500",
    tier: "premium"
  }
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
  const [showConversations, setShowConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
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

  // Initialize with sample conversations for demo
  useEffect(() => {
    const sampleConversations: Conversation[] = [
      {
        id: "conv-1",
        title: "React Best Practices",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "What are the best practices for React development?",
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Here are the key React best practices:\n\n1. **Component Organization**: Keep components small and focused\n2. **State Management**: Use useState for local state, Context for global\n3. **Performance**: Implement React.memo for expensive components\n4. **Error Boundaries**: Handle errors gracefully\n5. **Code Splitting**: Use lazy loading for better performance",
            timestamp: new Date(Date.now() - 86400000),
            model: selectedModel
          }
        ],
        lastActivity: new Date(Date.now() - 86400000),
        model: selectedModel,
        pinned: true
      },
      {
        id: "conv-2",
        title: "AI Model Comparison",
        messages: [
          {
            id: "msg-3",
            role: "user",
            content: "Compare GPT-4 vs Claude vs Gemini",
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
          }
        ],
        lastActivity: new Date(Date.now() - 172800000),
        model: "provider-6/gpt-4.1",
        pinned: false
      },
      {
        id: "conv-3",
        title: "Python Data Science",
        messages: [
          {
            id: "msg-4",
            role: "user",
            content: "How to get started with Python for data science?",
            timestamp: new Date(Date.now() - 259200000), // 3 days ago
          }
        ],
        lastActivity: new Date(Date.now() - 259200000),
        model: "provider-2/deepseek-r1-0528",
        pinned: false
      }
    ];
    setConversations(sampleConversations);
  }, [selectedModel]);

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Chat",
      messages: [],
      lastActivity: new Date(),
      model: selectedModel,
      pinned: false
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    clearChat();
  };

  const saveCurrentConversation = useCallback(() => {
    if (messages.length > 0 && currentConversationId) {
      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...messages],
              lastActivity: new Date(),
              title: messages[0]?.content.slice(0, 50) + "..." || "New Chat"
            }
          : conv
      ));
    }
  }, [messages, currentConversationId]);

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setSelectedModel(conversation.model);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
  };

  const togglePinConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, pinned: !conv.pinned }
        : conv
    ));
  };

  const renameConversation = (conversationId: string, newTitle: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, title: newTitle }
        : conv
    ));
  };

  // Auto-save conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 0) {
        saveCurrentConversation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [messages, saveCurrentConversation]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(msg =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  // Chat History Sidebar Component
  const ChatHistorySidebar = () => {
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    return (
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-40 ${
        showConversations ? "w-80" : "w-0"
      } overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="font-semibold text-white">Chat History</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConversations(false)}
                className="text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 focus:border-purple-500"
              />
            </div>

            {/* New Chat Button */}
            <Button
              onClick={startNewConversation}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-800/50 ${
                      currentConversationId === conversation.id
                        ? "bg-purple-500/20 border border-purple-500/30"
                        : "hover:bg-slate-700/30"
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {conversation.pinned && (
                            <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          )}
                          {editingTitle === conversation.id ? (
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => {
                                renameConversation(conversation.id, editTitle);
                                setEditingTitle(null);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameConversation(conversation.id, editTitle);
                                  setEditingTitle(null);
                                }
                              }}
                              className="text-sm bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                              autoFocus
                            />
                          ) : (
                            <h3
                              className="font-medium text-sm text-slate-200 truncate"
                              onDoubleClick={() => {
                                setEditingTitle(conversation.id);
                                setEditTitle(conversation.title);
                              }}
                            >
                              {conversation.title}
                            </h3>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {conversation.lastActivity.toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{conversation.messages.length} messages</span>
                        </div>

                        {/* Model Badge */}
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {chatModels.find(m => m.id === conversation.model)?.icon} {chatModels.find(m => m.id === conversation.model)?.name || 'Unknown Model'}
                          </Badge>
                        </div>

                        {/* Last Message Preview */}
                        {conversation.messages.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            {conversation.messages[conversation.messages.length - 1]?.content.slice(0, 100)}...
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePinConversation(conversation.id);
                                }}
                              >
                                <Pin className={`w-3 h-3 ${conversation.pinned ? 'text-yellow-400' : 'text-slate-400'}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {conversation.pinned ? 'Unpin' : 'Pin'} conversation
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete conversation</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{conversations.length} conversations</span>
              <Button variant="ghost" size="sm" className="text-xs h-6">
                <Archive className="w-3 h-3 mr-1" />
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className={`flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ${
      isFullscreen ? "fixed inset-0 z-50" : ""
    }`}>
      {!isFullscreen && <AppSidebar defaultCollapsed={true} />}
      <div className="flex-1 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button - positioned to work with sidebar */}
      {!isFullscreen && (
        <BackButton
          className={`transition-all duration-300 ${
            showConversations ? "md:left-[21rem]" : "left-6"
          }`}
        />
      )}

      {/* Chat History Sidebar */}
      <ChatHistorySidebar />

      <div className={`h-screen flex flex-col transition-all duration-300 ${
        showConversations ? "md:ml-80" : "ml-0"
      } ${!isFullscreen ? "pt-16" : ""}`}>
        {/* Chat Header */}
        <div className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!showConversations && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConversations(true)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold">AI Chat</h1>
                </div>
                
                {currentModel && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-full border border-slate-600/30">
                    <span className="text-lg">{currentModel.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{currentModel.name}</span>
                      <span className="text-xs text-slate-400">{currentModel.provider}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs h-5 ${
                        currentModel.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        currentModel.tier === 'standard' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}
                    >
                      {currentModel.tier}
                    </Badge>
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
                          <SelectContent className="bg-slate-800 border-slate-700 max-h-96">
                            {/* Group models by category */}
                            {Object.entries(
                              chatModels.reduce((groups, model) => {
                                const category = model.category;
                                if (!groups[category]) groups[category] = [];
                                groups[category].push(model);
                                return groups;
                              }, {} as Record<string, typeof chatModels>)
                            ).map(([category, models]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                                  {category}
                                </div>
                                {models.map((model) => (
                                  <SelectItem key={model.id} value={model.id} className="focus:bg-slate-700">
                                    <div className="flex items-center gap-3 w-full">
                                      <span className="text-lg">{model.icon}</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{model.name}</span>
                                          <Badge
                                            variant="outline"
                                            className={`text-xs h-4 px-1 ${
                                              model.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                                              model.tier === 'standard' ? 'bg-blue-500/20 text-blue-400' :
                                              'bg-green-500/20 text-green-400'
                                            }`}
                                          >
                                            {model.tier}
                                          </Badge>
                                        </div>
                                        <div className="text-xs text-slate-400">{model.provider}</div>
                                        <div className="text-xs text-slate-500 mt-1">{model.description}</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {model.capabilities.slice(0, 2).map((cap, idx) => (
                                            <span key={idx} className="text-xs bg-slate-700/50 px-1 rounded">
                                              {cap}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Current Model Info */}
                        {currentModel && (
                          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{currentModel.icon}</span>
                              <span className="font-medium">{currentModel.name}</span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  currentModel.tier === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  currentModel.tier === 'standard' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}
                              >
                                {currentModel.tier}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">{currentModel.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {currentModel.capabilities.map((cap, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
              <div className="relative flex items-end gap-3 bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/50 focus-within:border-purple-500/70 focus-within:shadow-lg focus-within:shadow-purple-500/20 transition-all duration-300">
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
                    className="h-10 w-10 p-0 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-600 hover:via-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
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
      </div>

    </div>
  );
}
