import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp, useResetPassword } from "@/hooks/useAuth";
import { Loader2, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeView, setActiveView] = useState<"signin" | "signup" | "forgot">(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        
        {/* Main container with purple gradient border */}
        <div className="relative">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 p-[2px]">
            <div className="h-full w-full rounded-3xl bg-slate-900"></div>
          </div>
          
          {/* Content */}
          <div className="relative rounded-3xl bg-slate-900 p-8">
            {activeView === "signin" && (
              <SignInForm 
                onForgotPassword={() => setActiveView("forgot")} 
                onSignUpClick={() => setActiveView("signup")}
                onSuccess={onClose} 
              />
            )}
            
            {activeView === "signup" && (
              <SignUpForm 
                onSignInClick={() => setActiveView("signin")}
                onSuccess={onClose} 
              />
            )}
            
            {activeView === "forgot" && (
              <ForgotPasswordForm onBack={() => setActiveView("signin")} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SignInForm({ onForgotPassword, onSignUpClick, onSuccess }: { 
  onForgotPassword: () => void; 
  onSignUpClick: () => void;
  onSuccess: () => void; 
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate({ email, password }, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-slate-400">Sign in to your LoveAIHub account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-14 pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="h-14 pl-12 pr-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
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

        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            className="px-0 text-sm text-purple-400 hover:text-purple-300"
            onClick={onForgotPassword}
          >
            Forgot your password?
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl" 
          disabled={signIn.isPending}
        >
          {signIn.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-900 px-4 text-slate-400">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <Button 
        variant="outline" 
        className="w-full h-14 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl text-lg font-medium" 
        type="button"
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-slate-400">Don't have an account? </span>
        <Button
          variant="link"
          className="px-0 text-purple-400 hover:text-purple-300 font-medium"
          onClick={onSignUpClick}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}

function SignUpForm({ onSignInClick, onSuccess }: { onSignInClick: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signUp = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");
    signUp.mutate({ email, password, firstName, lastName }, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-slate-400">Join LoveAIHub and start creating</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-white">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="h-14 pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signupEmail" className="text-sm font-medium text-white">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="signupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-14 pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signupPassword" className="text-sm font-medium text-white">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              minLength={6}
              className="h-14 pl-12 pr-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
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
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className="h-14 pl-12 pr-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
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
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl" 
          disabled={signUp.isPending}
        >
          {signUp.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-900 px-4 text-slate-400">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <Button 
        variant="outline" 
        className="w-full h-14 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl text-lg font-medium" 
        type="button"
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-slate-400">Already have an account? </span>
        <Button
          variant="link"
          className="px-0 text-purple-400 hover:text-purple-300 font-medium"
          onClick={onSignInClick}
        >
          Log in
        </Button>
      </div>
    </div>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const resetPassword = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword.mutate(email, {
      onSuccess: () => onBack(),
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 p-0 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </Button>

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
        <p className="text-slate-400">No worries! Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="resetEmail" className="text-sm font-medium text-white">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="h-14 pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={resetPassword.isPending} 
          className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-lg rounded-xl"
        >
          {resetPassword.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      {/* Help Section */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
          <div className="space-y-1">
            <h3 className="font-medium text-white">Having trouble?</h3>
            <p className="text-sm text-slate-400">
              If you don't receive an email within a few minutes, check your spam folder or contact our support team.
            </p>
          </div>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-slate-400">Don't have an account? </span>
        <Button
          variant="link"
          className="px-0 text-purple-400 hover:text-purple-300 font-medium"
          onClick={onBack}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}