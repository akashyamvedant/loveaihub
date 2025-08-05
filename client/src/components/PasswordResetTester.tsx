import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function PasswordResetTester() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }

      toast({
        title: "Success",
        description: "Password reset email sent! Check your email for the reset link.",
      });

      setEmail('');
    } catch (error: any) {
      console.error('Reset email error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to send reset email',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Test Password Reset</h2>
        <p className="text-slate-400 text-sm">
          Enter your email to receive a password reset link
        </p>
      </div>
      
      <form onSubmit={handleSendResetEmail} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-white">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
            className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 rounded-xl"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl"
        >
          {isLoading ? 'Sending...' : 'Send Reset Email'}
        </Button>
      </form>

      <div className="bg-slate-800 p-4 rounded-xl">
        <h3 className="text-white font-medium mb-2">Instructions:</h3>
        <ol className="text-slate-400 text-sm space-y-1">
          <li>1. Enter your email above and click "Send Reset Email"</li>
          <li>2. Check your email for the reset link</li>
          <li>3. Click the link in your email to open the reset page with valid tokens</li>
          <li>4. Set your new password (should work without "auth session missing" error)</li>
        </ol>
      </div>
    </div>
  );
}