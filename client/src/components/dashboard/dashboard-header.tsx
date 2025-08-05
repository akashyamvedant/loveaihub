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
  Crown
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = async () => {
    try {
      // Clear local auth data first
      localStorage.removeItem('supabase-auth-token');
      document.cookie = 'supabase-auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.loveaihub.com';
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Force complete page reload to reset all state
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even on error to clear state
      window.location.replace('/');
    }
  };

  return (
    <div className="sticky top-0 z-40 glass-effect border-b border-border/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* User Greeting */}
          <div className="flex-shrink-0 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
          
          {/* Right Side - Search, Notification, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar */}
            <div className="relative w-48 sm:w-64 lg:w-80 hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tools, generations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 h-10 bg-background/50 border-border/20 focus:border-primary/50 transition-all"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchValue("")}
                >
                  ×
                </Button>
              )}
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="sm" className="h-10 w-10 sm:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notification Icon */}
            <Button variant="ghost" size="sm" className="relative h-10 w-10 flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                3
              </span>
            </Button>

            {/* Profile Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full flex-shrink-0">
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
        </div>

        {/* Description and Actions Below Header */}
        {(description || children) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 space-y-3 sm:space-y-0">
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
            {children && (
              <div className="flex items-center space-x-2">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}