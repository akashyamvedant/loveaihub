import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import UsageAnalytics from "@/components/dashboard/usage-analytics";
import FavoritesShortcuts from "@/components/dashboard/favorites-shortcuts";
import GenerationHistory from "@/components/generation-history";
import SubscriptionManager from "@/components/subscription-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Crown, Plus, LayoutGrid, Activity, BarChart3, Heart } from "lucide-react";

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
        {/* Enhanced Stats Overview */}
        <StatsCards />

        {/* Subscription Manager for Free Users - Priority Display */}
        {(user as any)?.subscriptionType === "free" && (
          <SubscriptionManager />
        )}

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card w-full justify-start">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Recent Activity</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Shortcuts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Main Dashboard */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions Grid */}
            <QuickActions />
            
            {/* Two Column Layout for Activity & History */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <RecentActivity />
              <div className="space-y-6">
                <GenerationHistory />
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <RecentActivity />
            <GenerationHistory />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <UsageAnalytics />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <StatsCards />
              <RecentActivity />
            </div>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-8">
            <FavoritesShortcuts />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}