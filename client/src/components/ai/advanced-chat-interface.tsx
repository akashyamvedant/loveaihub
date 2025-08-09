import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share,
  Edit3,
  Bookmark,
  Code,
  Download,
  Zap,
  Volume2,
  VolumeX,
  User,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from "lucide-react";

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
  status?: "sending" | "sent" | "error";
}

interface AdvancedChatInterfaceProps {
  messages: Message[];
  onCopyMessage: (content: string) => void;
  onRegenerateMessage: (messageIndex: number) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  user?: any;
  currentModel?: any;
  className?: string;
}

export function AdvancedChatInterface({
  messages,
  onCopyMessage,
  onRegenerateMessage,
  onEditMessage,
  onReactToMessage,
  user,
  currentModel,
  className = ""
}: AdvancedChatInterfaceProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedCodeBlocks, setExpandedCodeBlocks] = useState<Set<string>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Code syntax highlighting
  const renderCodeBlock = (code: string, language: string = "", messageId: string) => {
    const blockId = `${messageId}-${language}`;
    const isExpanded = expandedCodeBlocks.has(blockId);
    const shouldCollapse = code.split('\n').length > 10;

    return (
      <div className="relative my-4">
        <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">{language || "Code"}</span>
          </div>
          <div className="flex items-center gap-2">
            {shouldCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  const newSet = new Set(expandedCodeBlocks);
                  if (isExpanded) {
                    newSet.delete(blockId);
                  } else {
                    newSet.add(blockId);
                  }
                  setExpandedCodeBlocks(newSet);
                }}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => onCopyMessage(code)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <pre className={`bg-slate-900 p-4 rounded-b-lg border-x border-b border-slate-700 overflow-x-auto text-sm ${
          shouldCollapse && !isExpanded ? "max-h-48 overflow-y-hidden" : ""
        }`}>
          <code>{code}</code>
        </pre>
        {shouldCollapse && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newSet = new Set(expandedCodeBlocks);
                newSet.add(blockId);
                setExpandedCodeBlocks(newSet);
              }}
            >
              Show more
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Enhanced message rendering with markdown support
  const renderMessageContent = (content: string, messageId: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentCodeBlock = '';
    let currentLanguage = '';
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      // Code block detection
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          elements.push(
            <div key={`code-${index}`}>
              {renderCodeBlock(currentCodeBlock.trim(), currentLanguage, messageId)}
            </div>
          );
          currentCodeBlock = '';
          currentLanguage = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          currentLanguage = line.slice(3).trim();
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        currentCodeBlock += line + '\n';
      } else {
        // Regular text rendering with inline code and formatting
        let processedLine = line;
        
        // Inline code
        processedLine = processedLine.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-sm">$1</code>');
        
        // Bold text
        processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Links
        processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

        elements.push(
          <p 
            key={index} 
            className="mb-2 last:mb-0 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });

    // Handle case where message ends with an open code block
    if (inCodeBlock && currentCodeBlock) {
      elements.push(
        <div key="final-code">
          {renderCodeBlock(currentCodeBlock.trim(), currentLanguage, messageId)}
        </div>
      );
    }

    return <div className="space-y-2">{elements}</div>;
  };

  const speakMessage = async (content: string, messageId: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      if (playingAudio === messageId) {
        setPlayingAudio(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setPlayingAudio(messageId);
      utterance.onend = () => setPlayingAudio(null);
      utterance.onerror = () => setPlayingAudio(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const MessageActions = ({ message, index }: { message: Message; index: number }) => (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-700"
              onClick={() => onCopyMessage(message.content)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Copy message</TooltipContent>
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
                  className="h-7 w-7 p-0 hover:bg-slate-700"
                  onClick={() => onRegenerateMessage(index + 1)}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Regenerate response</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-slate-700"
                  onClick={() => speakMessage(message.content, message.id)}
                >
                  {playingAudio === message.id ? (
                    <VolumeX className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {playingAudio === message.id ? "Stop speech" : "Read aloud"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-slate-700"
                  onClick={() => onReactToMessage?.(message.id, "👍")}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Good response</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-slate-700"
                  onClick={() => onReactToMessage?.(message.id, "👎")}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Poor response</TooltipContent>
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
              className="h-7 w-7 p-0 hover:bg-slate-700"
              onClick={() => {
                setEditingMessageId(message.id);
                setEditContent(message.content);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Edit message</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-700"
            >
              <Share className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Share message</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-slate-700"
            >
              <Bookmark className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Bookmark</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const MessageBubble = ({ message, index }: { message: Message; index: number }) => (
    <div className={`group relative py-6 px-4 transition-all duration-200 hover:bg-slate-800/20 ${
      message.role === "user" ? "bg-slate-800/10" : ""
    }`}>
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className={`w-8 h-8 ${message.role === "assistant" ? "ring-2 ring-purple-500/30" : ""}`}>
            <AvatarFallback className={
              message.role === "user" 
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            }>
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </AvatarFallback>
            {user?.profileImageUrl && message.role === "user" && (
              <AvatarImage src={user.profileImageUrl} alt="User avatar" />
            )}
          </Avatar>
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-slate-200">
              {message.role === "user" ? (user?.firstName || "You") : "AI Assistant"}
            </span>
            
            {message.model && currentModel && (
              <Badge variant="outline" className="text-xs h-5 px-2 bg-slate-800/50">
                <span className="mr-1">{currentModel.icon}</span>
                {currentModel.name}
              </Badge>
            )}
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{message.timestamp.toLocaleTimeString()}</span>
              
              {message.status === "sending" && (
                <Badge variant="secondary" className="h-4 px-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </Badge>
              )}
              
              {message.status === "sent" && (
                <CheckCircle className="w-3 h-3 text-green-400" />
              )}
              
              {message.status === "error" && (
                <XCircle className="w-3 h-3 text-red-400" />
              )}
              
              {message.isEdited && (
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  edited
                </Badge>
              )}
            </div>
          </div>
          
          {/* Message Body */}
          <div className="prose prose-sm max-w-none prose-invert">
            {editingMessageId === message.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm resize-none"
                  rows={Math.min(editContent.split('\n').length + 1, 10)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onEditMessage?.(message.id, editContent);
                      setEditingMessageId(null);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMessageId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-slate-100 leading-relaxed">
                {renderMessageContent(message.content, message.id)}
              </div>
            )}
          </div>
          
          {/* Message Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-3">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-1 bg-slate-800/50 hover:bg-slate-700/50 rounded-full px-2 py-1 text-xs transition-colors"
                  onClick={() => onReactToMessage?.(message.id, reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Message Actions */}
          <div className="mt-3">
            <MessageActions message={message} index={index} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-0 ${className}`}>
      {messages.map((message, index) => (
        <MessageBubble key={message.id} message={message} index={index} />
      ))}
    </div>
  );
}

export default AdvancedChatInterface;
