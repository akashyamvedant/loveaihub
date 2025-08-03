import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useSignOut } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, LogOut, User } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const { isAuthenticated, user } = useAuth();
  const signOut = useSignOut();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = isAuthenticated
    ? [
        { name: "Dashboard", path: "/" },
        { name: "Image Studio", path: "/image-generation" },
        { name: "Video Lab", path: "/video-generation" },
        { name: "AI Chat", path: "/ai-chat" },
        { name: "Audio Tools", path: "/audio-speech" },
        { name: "Image Editor", path: "/image-editing" },
        { name: "API Docs", path: "/api-docs" },
        { name: "Blog", path: "/blog" },
      ]
    : [
        { name: "Features", path: "#features" },
        { name: "AI Models", path: "#models" },
        { name: "Pricing", path: "/pricing" },
        { name: "Blog", path: "/blog" },
        { name: "Docs", path: "/api-docs" },
      ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LoveAIHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`transition-colors ${
                  location === item.path
                    ? "text-primary"
                    : "hover:text-primary text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </span>
                      </div>
                      <span className="text-sm">
                        {user?.firstName || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => signOut.mutate()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthModalTab("signin");
                    setShowAuthModal(true);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="btn-primary"
                  size="sm"
                  onClick={() => {
                    setAuthModalTab("signup");
                    setShowAuthModal(true);
                  }}
                >
                  Start Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 glass-effect">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        location === item.path
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="pt-4 border-t border-border">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 px-4 py-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                            </span>
                          </div>
                          <span className="text-sm">
                            {user?.firstName || "User"}
                          </span>
                        </div>
                        {user?.isAdmin && (
                          <Link href="/admin">
                            <Button variant="ghost" className="w-full justify-start">
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => signOut.mutate()}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setAuthModalTab("signin");
                            setShowAuthModal(true);
                          }}
                        >
                          Sign In
                        </Button>
                        <Button
                          className="btn-primary w-full"
                          onClick={() => {
                            setAuthModalTab("signup");
                            setShowAuthModal(true);
                          }}
                        >
                          Start Free
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </nav>
  );
}
