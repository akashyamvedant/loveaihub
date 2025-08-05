import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  Sparkles, 
  Home,
  Image, 
  Video, 
  MessageSquare, 
  Mic, 
  Edit, 
  Code,
  BookOpen,
  Settings,
  Crown,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
  Clock,
  BarChart3,
  Zap,
  TrendingUp
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview and analytics",
      badge: null,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Image Studio",
      href: "/image-generation",
      icon: Image,
      description: "AI image generation",
      badge: "Hot",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Video Lab",
      href: "/video-generation",
      icon: Video,
      description: "AI video creation",
      badge: "New",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "AI Chat",
      href: "/ai-chat",
      icon: MessageSquare,
      description: "Conversational AI",
      badge: null,
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Audio Tools",
      href: "/audio-speech",
      icon: Mic,
      description: "Speech synthesis",
      badge: null,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Image Editor",
      href: "/image-editing",
      icon: Edit,
      description: "AI-powered editing",
      badge: null,
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
      description: "Developer resources",
      badge: null,
      gradient: "from-slate-500 to-gray-500"
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
      description: "Latest updates",
      badge: null,
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full glass-card border-r border-border/20">
      {/* Header with enhanced styling */}
      <div className="relative p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            {(!sidebarCollapsed || mobile) && (
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text">LoveAIHub</span>
                <span className="text-xs text-muted-foreground">AI Creative Suite</span>
              </div>
            )}
          </Link>
          {!mobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex hover:bg-accent/50 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced User Info */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={(user as any)?.profileImageUrl} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white text-lg">
                {((user as any)?.firstName?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold truncate">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                {(user as any)?.subscriptionType === "premium" && (
                  <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{(user as any)?.email}</p>
              
              {/* Usage Progress for Free Users */}
              {(user as any)?.subscriptionType === "free" && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="text-muted-foreground">
                      {(user as any)?.generationsUsed || 0}/{(user as any)?.generationsLimit || 50}
                    </span>
                  </div>
                  <Progress 
                    value={((user as any)?.generationsUsed || 0) / ((user as any)?.generationsLimit || 50) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    group relative flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                    ${active 
                      ? 'bg-gradient-to-r from-primary/20 to-purple-500/10 border border-primary/30 shadow-md' 
                      : 'hover:bg-accent/50 hover:scale-[1.02]'
                    }
                  `}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => mobile && setSidebarOpen(false)}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-r-full"></div>
                  )}
                  
                  <div className={`
                    relative p-2 rounded-lg transition-all duration-200
                    ${active 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : 'bg-accent/20 group-hover:bg-accent/40'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-foreground'}`} />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {(!sidebarCollapsed || mobile) && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${active ? 'text-primary' : 'text-foreground'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs ml-2 bg-red-500/20 text-red-400 border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  {hoveredItem === item.href && !active && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator className="bg-border/20" />

      {/* Enhanced Footer */}
      <div className="p-4 space-y-3">
        {/* Quick Stats */}
        {(!sidebarCollapsed || mobile) && (user as any)?.subscriptionType === "premium" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-2 rounded-lg border border-green-500/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-2 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs font-medium">Unlimited</p>
                  <p className="text-xs text-muted-foreground">Generations</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-accent/50 transition-colors"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-3" />
            {(!sidebarCollapsed || mobile) && "Settings"}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {(!sidebarCollapsed || mobile) && "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={`
        hidden lg:flex transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-80'}
      `}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 glass-effect hover:bg-accent/20"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80 bg-background/95 backdrop-blur-xl border-r border-border/20">
          <SidebarContent mobile={true} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}