import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter
} from "lucide-react";
import { useUserAnalytics } from "@/hooks/useDashboardData";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

export default function UsageAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [activeChart, setActiveChart] = useState<'daily' | 'models'>('daily');
  const { data: analytics, isLoading } = useUserAnalytics(selectedPeriod);

  // Transform API data for daily usage chart
  const dailyData = analytics?.dailyStats ? 
    analytics.dailyStats.reduce((acc: any[], item: any) => {
      const existingDate = acc.find(d => d.date === item.date);
      if (existingDate) {
        existingDate[item.type] = (existingDate[item.type] || 0) + item.count;
        existingDate.total += item.count;
      } else {
        acc.push({
          date: item.date,
          [item.type]: item.count,
          total: item.count,
          name: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      return acc;
    }, []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  // Transform API data for model usage pie chart
  const modelData = analytics?.modelStats?.slice(0, 6).map((item: any, index: number) => ({
    name: item.model,
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Usage Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your AI generation patterns and model usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setSelectedPeriod(selectedPeriod === "7days" ? "30days" : "7days")}
          >
            <Calendar className="w-4 h-4" />
            {selectedPeriod === "7days" ? "7 Days" : "30 Days"}
          </Button>
          <Button
            variant="outline"
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setActiveChart(activeChart === 'daily' ? 'models' : 'daily')}
          >
            <Filter className="w-4 h-4" />
            {activeChart === 'daily' ? 'Daily Usage' : 'Model Usage'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {!analytics || (dailyData.length === 0 && modelData.length === 0) ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No usage data available</p>
            <p className="text-sm text-muted-foreground">
              Start using AI tools to see your analytics here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Period Summary */}
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Generations</p>
                <p className="text-2xl font-bold">
                  {dailyData.reduce((sum, day) => sum + day.total, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-medium">{selectedPeriod === "7days" ? "Last 7 Days" : "Last 30 Days"}</p>
              </div>
            </div>

            {/* Chart Display */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'daily' ? (
                  dailyData.length > 0 ? (
                    <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="image" fill="#3b82f6" name="Images" />
                      <Bar dataKey="video" fill="#8b5cf6" name="Videos" />
                      <Bar dataKey="chat" fill="#10b981" name="Chat" />
                      <Bar dataKey="audio" fill="#f59e0b" name="Audio" />
                    </BarChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No daily usage data</p>
                    </div>
                  )
                ) : (
                  modelData.length > 0 ? (
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <Pie
                        data={modelData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        className="text-xs"
                      >
                        {modelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [value, 'Generations']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No model usage data</p>
                    </div>
                  )
                )}
              </ResponsiveContainer>
            </div>

            {/* Model Stats Summary */}
            {modelData.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Top Models
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modelData.slice(0, 6).map((model, index) => (
                    <div key={model.name} className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: model.color }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.value} uses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}