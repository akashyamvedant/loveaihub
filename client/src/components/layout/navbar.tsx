import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu,
  Sparkles,
  User,
  Settings,
  LogOut,
  Crown,
  Shield,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "Features", href: isAuthenticated ? "/" : "/#features" },
    { name: "AI Models", href: isAuthenticated ? "/" : "/#models" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Docs", href: "/docs" },
  ];

  const aiServices = [
    { name: "Image Generation", href: "/image-generation" },
    { name: "Video Creation", href: "/video-generation" },
    { name: "AI Chat", href: "/ai-chat" },
    { name: "Audio & Speech", href: "/audio-speech" },
    { name: "Image Editing", href: "/image-editing" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <a href="/" className="text-xl font-bold gradient-text">
              LoveAIHub
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            {/* AI Services Dropdown */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    AI Services
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-effect">
                  <DropdownMenuLabel>AI Services</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {aiServices.map((service) => (
                    <DropdownMenuItem key={service.name} asChild>
                      <a href={service.href} className="cursor-pointer">
                        {service.name}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                {/* Usage Badge */}
                <Badge variant="secondary" className="hidden sm:flex">
                  {user.generationsUsed}/{user.generationsLimit === -1 ? '∞' : user.generationsLimit}
                </Badge>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="hidden sm:block">
                        {user.firstName || 'Account'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-effect w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span>{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                      {user.subscriptionTier === 'premium' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <a href="/" className="cursor-pointer">
                        Dashboard
                      </a>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <a href="/pricing" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Subscription
                      </a>
                    </DropdownMenuItem>
                    
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <a href="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </a>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <a href="/api/login">Sign In</a>
                </Button>
                <Button className="btn-depth" asChild>
                  <a href="/api/login">Start Free</a>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-effect w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Navigation Items */}
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  
                  {/* AI Services for Mobile */}
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">AI Services</p>
                        {aiServices.map((service) => (
                          <a
                            key={service.name}
                            href={service.href}
                            className="block text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
                            onClick={() => setIsOpen(false)}
                          >
                            {service.name}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Auth Section for Mobile */}
                  {!isAuthenticated && (
                    <div className="border-t border-border pt-4 mt-4 space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <a href="/api/login" onClick={() => setIsOpen(false)}>
                          Sign In
                        </a>
                      </Button>
                      <Button className="w-full btn-depth" asChild>
                        <a href="/api/login" onClick={() => setIsOpen(false)}>
                          Start Free
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
