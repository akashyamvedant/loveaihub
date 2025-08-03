import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle,
  User,
  LogOut,
  Crown,
  Zap,
  TrendingUp,
  Calendar
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  const currentTime = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="sticky top-0 z-40 glass-effect border-b border-border/20 shadow-lg">
      <div className="container mx-auto px-6 py-6">
        {/* Top Row - Time and Quick Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>System Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>20+ Models</span>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={(user as any)?.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                    {((user as any)?.firstName?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium leading-none">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </p>
                    {(user as any)?.subscriptionType === "premium" && (
                      <Badge variant="default" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(user as any)?.email}
                  </p>
                  {(user as any)?.subscriptionType === "free" && (
                    <div className="text-xs text-muted-foreground">
                      {(user as any)?.generationsUsed || 0}/{(user as any)?.generationsLimit || 50} generations used
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Title Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </h1>
              {(user as any)?.subscriptionType === "premium" && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400">Pro</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {/* Action Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:min-w-0">
            {/* Enhanced Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tools, generations, templates..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 h-11 glass-card border-border/20 focus:border-primary/50 transition-all"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchValue("")}
                >
                  ×
                </Button>
              )}
            </div>

            {/* Notification Button */}
            <Button variant="ghost" size="sm" className="relative h-11 w-11 glass-card hover:bg-accent/20">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                3
              </span>
            </Button>

            {/* Action Buttons from Props */}
            <div className="flex items-center space-x-2">
              {children}
            </div>
          </div>
        </div>

        {/* Usage Indicator for Free Users */}
        {(user as any)?.subscriptionType === "free" && (
          <div className="mt-4 p-3 rounded-lg glass-card border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-amber-200">
                  {(user as any)?.generationsUsed || 0} of {(user as any)?.generationsLimit || 50} generations used this month
                </span>
              </div>
              <Badge variant="outline" className="border-amber-500/30 text-amber-200">
                Free Plan
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}