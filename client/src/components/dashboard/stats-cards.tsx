import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Crown,
  Image,
  Video,
  MessageSquare,
  Mic
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function StatsCards() {
  const { user } = useAuth();

  const usagePercentage = user?.subscriptionType === "free" 
    ? ((user?.generationsUsed || 0) / (user?.generationsLimit || 50)) * 100 
    : 0;

  const stats = [
    {
      title: "Usage This Month",
      value: user?.subscriptionType === "premium" ? "Unlimited" : `${user?.generationsUsed || 0}/${user?.generationsLimit || 50}`,
      change: "+12% from last month",
      icon: TrendingUp,
      color: "text-green-500",
      showProgress: user?.subscriptionType === "free"
    },
    {
      title: "AI Models Available",
      value: "20+",
      change: "Across all categories",
      icon: Zap,
      color: "text-blue-500"
    },
    {
      title: "Avg. Generation Time",
      value: "2.3s",
      change: "40% faster than average",
      icon: Clock,
      color: "text-purple-500"
    },
    {
      title: "Subscription Status",
      value: user?.subscriptionType === "premium" ? "Premium" : "Free",
      change: user?.subscriptionType === "premium" ? "All features unlocked" : "Upgrade for unlimited access",
      icon: Crown,
      color: user?.subscriptionType === "premium" ? "text-yellow-500" : "text-gray-500"
    }
  ];

  const quickStats = [
    {
      label: "Images Generated",
      value: "1,234",
      icon: Image,
      color: "bg-blue-500"
    },
    {
      label: "Videos Created",
      value: "56",
      icon: Video,
      color: "bg-purple-500"
    },
    {
      label: "Chat Messages",
      value: "789",
      icon: MessageSquare,
      color: "bg-green-500"
    },
    {
      label: "Audio Files",
      value: "23",
      icon: Mic,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card hover:scale-105 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
                {stat.showProgress && (
                  <div className="mt-3">
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.generationsUsed || 0} of {user?.generationsLimit || 50} generations used
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Generation Statistics</span>
            <Badge variant="secondary">This Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}