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
  TrendingUp,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  defaultCollapsed?: boolean;
  showToggle?: boolean;
  className?: string;
}

export function AppSidebar({ defaultCollapsed = false, showToggle = true, className }: AppSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user } = useAuth();
  const [location] = useLocation();

  // Enhanced navigation items with better organization
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview and analytics",
      category: "main",
      badge: null,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Image Studio",
      href: "/image-generation",
      icon: Image,
      description: "AI image generation",
      category: "creative",
      badge: "Hot",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Video Lab",
      href: "/video-generation",
      icon: Video,
      description: "AI video creation",
      category: "creative",
      badge: "New",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "AI Chat",
      href: "/ai-chat",
      icon: MessageSquare,
      description: "Conversational AI",
      category: "ai",
      badge: null,
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Audio Tools",
      href: "/audio-speech",
      icon: Mic,
      description: "Speech synthesis",
      category: "creative",
      badge: null,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Image Editor",
      href: "/image-editing",
      icon: Edit,
      description: "AI-powered editing",
      category: "creative",
      badge: null,
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
      description: "Developer resources",
      category: "developer",
      badge: null,
      gradient: "from-slate-500 to-gray-500"
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
      description: "Latest updates",
      category: "content",
      badge: null,
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem('supabase-auth-token');
      document.cookie = 'supabase-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.loveaihub.com';
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('/');
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/" || location === "/dashboard" || location === "/home";
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  // Calculate viewport height minus header space
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex flex-col glass-card border-r border-border/20 bg-background/95 backdrop-blur-xl",
      "h-screen max-h-screen overflow-hidden",
      mobile ? "h-[100vh]" : "h-[calc(100vh)]"
    )}>
      {/* Enhanced Header with world-class styling */}
      <div className="relative p-4 border-b border-border/10 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-blue-500 flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-all duration-300 hover:shadow-primary/25">
                <Sparkles className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg"></div>
            </div>
            {(!sidebarCollapsed || mobile) && (
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LoveAIHub
                </span>
                <span className="text-xs text-muted-foreground font-medium">AI Creative Suite</span>
              </div>
            )}
          </Link>
          {!mobile && showToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            >
              {sidebarCollapsed ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced User Profile Section */}
      <div className="p-4 border-b border-border/10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={(user as any)?.profileImageUrl} alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-primary via-purple-600 to-blue-600 text-white text-lg font-semibold">
                {((user as any)?.firstName?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-background shadow-sm"></div>
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold truncate text-foreground">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </p>
                {(user as any)?.subscriptionType === "premium" && (
                  <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-md">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{(user as any)?.email}</p>
              
              {/* Enhanced Usage Progress */}
              {(user as any)?.subscriptionType === "free" && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Daily Usage</span>
                    <span className="text-muted-foreground font-mono">
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

      {/* Enhanced Navigation with perfect scrolling */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
        <div className="p-2 space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer",
                    "hover:shadow-md hover:scale-[1.02] transform-gpu",
                    active 
                      ? 'bg-gradient-to-r from-primary/15 via-purple-500/10 to-blue-500/5 border border-primary/30 shadow-lg backdrop-blur-sm' 
                      : 'hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10 hover:border hover:border-border/20'
                  )}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => mobile && setSidebarOpen(false)}
                >
                  {/* Enhanced Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-purple-500 to-blue-500 rounded-r-full shadow-sm"></div>
                  )}
                  
                  <div className={cn(
                    "relative p-2.5 rounded-xl transition-all duration-300 shadow-sm",
                    active 
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg hover:shadow-xl` 
                      : 'bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/40 group-hover:to-accent/20 group-hover:shadow-md'
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      active ? 'text-white drop-shadow-sm' : 'text-foreground'
                    )} />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-sm"></div>
                    )}
                  </div>
                  
                  {(!sidebarCollapsed || mobile) && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            active ? 'text-primary font-semibold' : 'text-foreground'
                          )}>
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate font-medium">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs ml-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border-0 shadow-sm">
                              {item.badge}
                            </Badge>
                          )}
                          {hoveredItem === item.href && !active && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-border/30 to-transparent" />

      {/* Enhanced Footer with Premium Features */}
      <div className="p-4 space-y-3 border-t border-border/10 bg-gradient-to-b from-background/50 to-background/80">
        {/* Premium Stats */}
        {(!sidebarCollapsed || mobile) && (user as any)?.subscriptionType === "premium" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/5 p-2.5 rounded-xl border border-green-500/20 shadow-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs font-semibold text-green-600">Premium</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/5 p-2.5 rounded-xl border border-blue-500/20 shadow-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs font-semibold text-blue-600">Unlimited</p>
                  <p className="text-xs text-muted-foreground">Usage</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 transition-all duration-200 hover:shadow-sm"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-3" />
            {(!sidebarCollapsed || mobile) && "Settings"}
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-gradient-to-r hover:from-destructive/10 hover:to-red-500/10 hover:text-destructive transition-all duration-200 hover:shadow-sm"
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
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex transition-all duration-300 ease-in-out flex-shrink-0",
        sidebarCollapsed ? 'w-20' : 'w-80',
        className
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 glass-effect hover:bg-accent/20 shadow-lg backdrop-blur-sm"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="p-0 w-80 bg-background/95 backdrop-blur-xl border-r border-border/20"
        >
          <SidebarContent mobile={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}
