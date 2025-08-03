import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSignIn, useSignUp, useResetPassword } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showForgotPassword ? "Reset Password" : activeTab === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        {showForgotPassword ? (
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm onForgotPassword={() => setShowForgotPassword(true)} onSuccess={onClose} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm onSuccess={onClose} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SignInForm({ onForgotPassword, onSuccess }: { onForgotPassword: () => void; onSuccess: () => void }) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="link"
          className="px-0 text-sm"
          onClick={onForgotPassword}
        >
          Forgot password?
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={signIn.isPending}>
        {signIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <Input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Choose a password (min 6 characters)"
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full" disabled={signUp.isPending}>
        {signUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resetEmail">Email</Label>
        <Input
          id="resetEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" disabled={resetPassword.isPending} className="flex-1">
          {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Email
        </Button>
      </div>
    </form>
  );
}