import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Send, 
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  RotateCcw,
  Settings
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface ChatInterfaceProps {
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
    capabilities: string[];
  }>;
  tools: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
  }>;
  websocket: WebSocket | null;
}

export default function ChatInterface({ 
  selectedModel, 
  onModelChange, 
  models, 
  tools, 
  websocket 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with a wide range of tasks including answering questions, creative writing, analysis, and more. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket message handling
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_response') {
          setMessages(prev => prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, content: data.content }
              : msg
          ));
          setIsTyping(false);
        }
      };
    }
  }, [websocket]);

  const chatMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.result.choices[0]?.message?.content || 'No response generated',
        timestamp: new Date(),
        model: selectedModel,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
    },
    onError: (error) => {
      setIsTyping(false);
      
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
        title: "Chat failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    if (user?.subscriptionTier === 'free' && user.generationsUsed >= user.generationsLimit) {
      toast({
        title: "Generation limit reached",
        description: "Upgrade to Premium for unlimited chat",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    const chatMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    chatMutation.mutate({
      model: selectedModel,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message copied successfully",
    });
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }]);
  };

  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Chat Header */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              AI Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Model Selection */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
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
            {currentModel && (
              <Badge variant="outline" className="text-xs">
                {currentModel.category}
              </Badge>
            )}
          </div>

          {/* Available Tools */}
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <Badge
                key={tool.id}
                variant={tool.enabled ? "default" : "secondary"}
                className={`text-xs ${
                  tool.enabled 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {tool.icon}
                <span className="ml-1">{tool.name}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="glass-effect">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-purple-500 text-white'
                  }>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.model && (
                      <span>• {models.find(m => m.id === message.model)?.name}</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => copyMessage(message.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatMutation.isPending}
                className="min-h-[40px] resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={chatMutation.isPending || !inputMessage.trim()}
              className="btn-depth"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Model: {currentModel?.name}</span>
              {websocket && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Connected
                </Badge>
              )}
            </div>
            <span>
              {user?.generationsUsed}/{user?.generationsLimit === -1 ? '∞' : user?.generationsLimit} used
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
