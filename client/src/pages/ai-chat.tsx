import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  Send,
  Loader2,
  Copy,
  Trash2,
  Settings,
  Search,
  Brain,
} from "lucide-react";

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
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access AI chat.",
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
        variant: "destructive",
      });
    },
  });


    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    const chatMessages = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

    </div>
  );
}
