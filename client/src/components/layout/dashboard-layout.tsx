import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
  User
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview and analytics"
    },
    {
      title: "Image Studio",
      href: "/image-generation",
      icon: Image,
      description: "AI image generation"
    },
    {
      title: "Video Lab",
      href: "/video-generation",
      icon: Video,
      description: "AI video creation"
    },
    {
      title: "AI Chat",
      href: "/ai-chat",
      icon: MessageSquare,
      description: "Conversational AI"
    },
    {
      title: "Audio Tools",
      href: "/audio-speech",
      icon: Mic,
      description: "Speech synthesis"
    },
    {
      title: "Image Editor",
      href: "/image-editing",
      icon: Edit,
      description: "AI-powered editing"
    },
    {
      title: "API Docs",
      href: "/api-docs",
      icon: Code,
      description: "Developer resources"
    },
    {
      title: "Blog",
      href: "/blog",
      icon: BookOpen,
      description: "Latest updates"
    }
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/10">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <span className="text-lg font-bold gradient-text">LoveAIHub</span>
          )}
        </Link>
        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={user?.subscriptionType === "premium" ? "default" : "secondary"} className="text-xs">
                  {user?.subscriptionType === "premium" ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
                {user?.subscriptionType === "free" && (
                  <span className="text-xs text-muted-foreground">
                    {user?.generationsUsed || 0}/{user?.generationsLimit || 50}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${
                  sidebarCollapsed && !mobile ? "px-3" : "px-4"
                } ${isActive ? "bg-primary/10 text-primary border-primary/20" : "hover:bg-accent/50"}`}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 ${sidebarCollapsed && !mobile ? "mx-auto" : "mr-3"}`} />
                {(!sidebarCollapsed || mobile) && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start h-10 ${
            sidebarCollapsed && !mobile ? "px-3" : "px-4"
          } text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
        >
          <LogOut className={`w-4 h-4 ${sidebarCollapsed && !mobile ? "mx-auto" : "mr-3"}`} />
          {(!sidebarCollapsed || mobile) && "Sign Out"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 h-full bg-card border-r border-border/10 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-80"
      }`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className={`lg:ml-80 ${sidebarCollapsed ? "lg:ml-20" : ""} transition-all duration-300`}>
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}