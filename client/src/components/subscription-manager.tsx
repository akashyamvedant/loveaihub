import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Zap, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Gift
} from "lucide-react";

export default function SubscriptionManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscribe", {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Created",
        description: "Redirecting to payment page...",
      });
      // In a real implementation, redirect to Razorpay payment page
      console.log("Subscription data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    setIsUpgrading(true);
    subscriptionMutation.mutate();
  };

  const isPremium = user?.subscriptionType === "premium";
  const usagePercentage = user?.subscriptionType === "free" 
    ? (user.generationsUsed / user.generationsLimit) * 100 
    : 0;

  const features = {
    free: [
      "50 generations per month",
      "Standard quality",
      "Community support",
      "Basic API access"
    ],
    premium: [
      "Unlimited generations",
      "HD quality & priority processing",
      "Advanced AI chat with tools",
      "Full API access",
      "Priority support",
      "Advanced analytics"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="glass-effect border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isPremium ? (
              <Crown className="w-6 h-6 text-yellow-400" />
            ) : (
              <Zap className="w-6 h-6 text-primary" />
            )}
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold capitalize">{user?.subscriptionType || "Free"}</h3>
              <p className="text-muted-foreground">
                {isPremium ? "Unlimited AI access" : "Limited monthly usage"}
              </p>
            </div>
            <Badge 
              variant={isPremium ? "default" : "outline"}
              className={isPremium ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""}
            >
              {isPremium ? "Premium" : "Free"}
            </Badge>
          </div>

          {!isPremium && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Monthly Usage</span>
                <span className="text-sm font-medium">
                  {user?.generationsUsed || 0} / {user?.generationsLimit || 50}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              {usagePercentage > 80 && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Running low on generations</span>
                </div>
              )}
            </div>
          )}

          {isPremium && (
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Unlimited generations this month</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="glass-effect border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Plan Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {features[user?.subscriptionType as keyof typeof features || "free"].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {!isPremium && (
        <Card className="glass-effect border-border border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span>Upgrade to Premium</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold mb-2">$5<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground">Unlimited access to all AI models</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Premium includes:</h4>
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Separator />

            <Button
              onClick={handleUpgrade}
              disabled={subscriptionMutation.isPending || isUpgrading}
              className="w-full btn-primary"
              size="lg"
            >
              {subscriptionMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Cancel anytime</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                30-day money-back guarantee
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Benefits */}
      {isPremium && (
        <Card className="glass-effect border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Premium Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">∞</div>
                <div className="text-xs text-muted-foreground">Generations</div>
              </div>
              
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">20+</div>
                <div className="text-xs text-muted-foreground">AI Models</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You're getting the most out of LoveAIHub!
              </p>
              <Button variant="outline" className="btn-secondary">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <Card className="glass-effect border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Usage Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold">{user?.generationsUsed || 0} generations</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan Status</span>
              <Badge variant={isPremium ? "default" : "outline"}>
                {isPremium ? "Active" : "Free Tier"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
