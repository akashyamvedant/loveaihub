import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Debug: Add page load indicator
  console.log('ResetPassword component mounted');

  useEffect(() => {
    console.log('Reset password useEffect triggered');
    setIsPageReady(true);
    
    // Enhanced token extraction with detailed debugging
    const fullUrl = window.location.href;
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    
    console.log('=== ENHANCED TOKEN DEBUGGING ===');
    console.log('Full URL:', fullUrl);
    console.log('Hash fragment:', hash);
    console.log('Search params:', search);
    
    // Parse both hash and search parameters
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    
    // Try multiple extraction methods
    const accessTokenFromHash = hashParams.get('access_token');
    const accessTokenFromSearch = searchParams.get('access_token'); 
    const refreshTokenFromHash = hashParams.get('refresh_token');
    const refreshTokenFromSearch = searchParams.get('refresh_token');
    const typeFromHash = hashParams.get('type');
    const typeFromSearch = searchParams.get('type');
    
    console.log('Hash extraction results:', {
      access_token: accessTokenFromHash ? `${accessTokenFromHash.substring(0, 30)}...` : null,
      refresh_token: refreshTokenFromHash ? 'present' : null,
      type: typeFromHash
    });
    
    console.log('Search extraction results:', {
      access_token: accessTokenFromSearch ? `${accessTokenFromSearch.substring(0, 30)}...` : null,
      refresh_token: refreshTokenFromSearch ? 'present' : null,
      type: typeFromSearch
    });
    
    // Choose the best token source
    const accessTokenFromUrl = accessTokenFromHash || accessTokenFromSearch;
    const refreshTokenFromUrl = refreshTokenFromHash || refreshTokenFromSearch;
    const type = typeFromHash || typeFromSearch;
    
    console.log('Final selected token:', {
      type,
      hasAccessToken: !!accessTokenFromUrl,
      tokenLength: accessTokenFromUrl?.length || 0,
      tokenStart: accessTokenFromUrl ? accessTokenFromUrl.substring(0, 50) + '...' : 'none'
    });
    
    if (type === 'recovery' && accessTokenFromUrl) {
      console.log('Valid recovery tokens found - setting state');
      setAccessToken(accessTokenFromUrl);
      setRefreshToken(refreshTokenFromUrl);
      
      // Clean up URL to remove sensitive tokens
      window.history.replaceState({}, document.title, '/reset-password');
      
      setTimeout(() => {
        toast({
          title: "Reset Link Valid",
          description: "You can now set your new password.",
        });
      }, 500);
    } else if (!type && !accessTokenFromUrl) {
      // Show debug information and allow user to proceed if they have tokens
      console.log('No tokens found in URL - this might be a direct visit or the tokens were cleared');
      // Always show the page, but provide helpful guidance
      setTimeout(() => {
        toast({
          title: "Reset Password", 
          description: "Please use the reset link from your email, or request a new password reset from the login page.",
          variant: "default",
        });
      }, 1000);
    } else {
      // Invalid tokens
      console.log('Invalid reset link detected');
      setTimeout(() => {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
      }, 1000);
      setTimeout(() => setLocation('/'), 5000);
    }
  }, [toast, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Invalid or expired reset link. Please request a new password reset.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    console.log('=== PASSWORD UPDATE ATTEMPT ===');
    console.log('Token available:', !!accessToken);
    console.log('Token length:', accessToken?.length || 0);
    console.log('Token preview:', accessToken ? accessToken.substring(0, 50) + '...' : 'NO TOKEN');
    console.log('Password length:', password?.length || 0);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password }),
      });

      const responseData = await response.json();
      console.log('Password update response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update password');
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been updated successfully!",
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        setLocation('/');
      }, 3000);

    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update password',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Always show loading state first to debug blank screen
  if (!isPageReady) {
    console.log('Page not ready, showing loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-600/20 blur-xl"></div>
        
        {/* Main container with purple gradient border */}
        <div className="relative w-full max-w-md">
          {/* Gradient border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-75"></div>
          
          {/* Content */}
          <div className="relative bg-slate-900 rounded-3xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Loading Reset Page...</h1>
            <p className="text-slate-400">Preparing password reset form</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-600/20 blur-xl"></div>
        
        {/* Main container with purple gradient border */}
        <div className="relative w-full max-w-md">
          {/* Gradient border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-75"></div>
          
          {/* Content */}
          <div className="relative bg-slate-900 rounded-3xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Password Updated</h1>
            <p className="text-slate-400">
              Your password has been successfully updated. You'll be redirected to the home page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-600/20 blur-xl"></div>
      
      {/* Main container with purple gradient border */}
      <div className="relative w-full max-w-md">
        {/* Gradient border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-75"></div>
        
        {/* Content */}
        <div className="relative bg-slate-900 rounded-3xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-slate-400">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your new password"
                    className="h-14 pl-12 pr-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm your new password"
                    className="h-14 pl-12 pr-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-purple-500/25"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Update Password
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => setLocation('/')}
                >
                  Back to Home
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}