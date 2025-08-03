import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp, useResetPassword } from "@/hooks/useAuth";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeView, setActiveView] = useState<"signin" | "signup" | "forgot">(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LoveAIHub</span>
          </div>

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
  const signIn = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate({ email, password }, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your LoveAIHub account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="h-11"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            className="px-0 text-sm text-primary hover:text-primary/80"
            onClick={onForgotPassword}
          >
            Forgot your password?
          </Button>
        </div>

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={signIn.isPending}>
          {signIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <Button variant="outline" className="w-full h-11" type="button">
        <FcGoogle className="mr-2 h-5 w-5" />
        Continue with Google
      </Button>

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Button
          variant="link"
          className="px-0 text-primary hover:text-primary/80 font-medium"
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const signUp = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp.mutate({ email, password, firstName, lastName }, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-muted-foreground">Join LoveAIHub and start creating</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signupEmail" className="text-sm font-medium">Email Address</Label>
          <Input
            id="signupEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
          <Input
            id="signupPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Choose a password (min 6 characters)"
            minLength={6}
            className="h-11"
          />
        </div>

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={signUp.isPending}>
          {signUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <Button variant="outline" className="w-full h-11" type="button">
        <FcGoogle className="mr-2 h-5 w-5" />
        Continue with Google
      </Button>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          className="px-0 text-primary hover:text-primary/80 font-medium"
          onClick={onSignInClick}
        >
          Sign in
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
    <div className="w-full max-w-sm space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 p-0 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resetEmail" className="text-sm font-medium">Email Address</Label>
          <Input
            id="resetEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="h-11"
          />
        </div>

        <Button type="submit" disabled={resetPassword.isPending} className="w-full h-11 bg-primary hover:bg-primary/90">
          {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Email
        </Button>
      </form>
    </div>
  );
}