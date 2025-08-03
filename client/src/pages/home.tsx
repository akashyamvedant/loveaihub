import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import GenerationHistory from "@/components/generation-history";
import SubscriptionManager from "@/components/subscription-manager";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Crown, Plus } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title={`${welcomeMessage()}, ${(user as any)?.firstName || 'User'}!`}
        description="Welcome to your AI-powered creative workspace"
      >
        {(user as any)?.subscriptionType === "free" && (
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
        <Link href="/image-generation">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Generation
          </Button>
        </Link>
      </DashboardHeader>

      <div className="container mx-auto px-6 py-6 space-y-8">
        {/* Stats Overview */}
        <StatsCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Subscription Manager for Free Users */}
        {(user as any)?.subscriptionType === "free" && (
          <SubscriptionManager />
        )}

        {/* Recent Activity */}
        <GenerationHistory />
      </div>
    </DashboardLayout>
  );
}