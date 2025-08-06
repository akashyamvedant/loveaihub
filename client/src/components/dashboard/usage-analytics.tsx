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
import { useState } from "react";

// Mock data for analytics
const weeklyUsageData = [
  { day: 'Mon', images: 12, videos: 3, chats: 8, audio: 2 },
  { day: 'Tue', images: 19, videos: 5, chats: 12, audio: 4 },
  { day: 'Wed', images: 15, videos: 2, chats: 15, audio: 3 },
  { day: 'Thu', images: 25, videos: 7, chats: 18, audio: 6 },
  { day: 'Fri', images: 22, videos: 4, chats: 14, audio: 5 },
  { day: 'Sat', images: 18, videos: 8, chats: 10, audio: 3 },
  { day: 'Sun', images: 14, videos: 3, chats: 9, audio: 2 }
];

const modelUsageData = [
  { name: 'FLUX Pro', value: 35, color: '#3b82f6' },
  { name: 'DALL-E 3', value: 25, color: '#8b5cf6' },
  { name: 'GPT-4', value: 20, color: '#10b981' },
  { name: 'Claude 3.5', value: 12, color: '#f59e0b' },
  { name: 'Others', value: 8, color: '#6b7280' }
];

const monthlyTrendData = [
  { month: 'Jan', generations: 45 },
  { month: 'Feb', generations: 52 },
  { month: 'Mar', generations: 61 },
  { month: 'Apr', generations: 58 },
  { month: 'May', generations: 72 },
  { month: 'Jun', generations: 89 },
  { month: 'Jul', generations: 94 }
];

export default function UsageAnalytics() {
  const [activeChart, setActiveChart] = useState<'weekly' | 'models' | 'monthly'>('weekly');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`${label}`}</p>
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

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <CardTitle>Usage Analytics</CardTitle>
            <Badge variant="secondary" className="text-xs">This Week</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2 mt-4">
          <Button
            variant={activeChart === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('weekly')}
            className="text-xs"
          >
            Weekly Usage
          </Button>
          <Button
            variant={activeChart === 'models' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('models')}
            className="text-xs"
          >
            Model Usage
          </Button>
          <Button
            variant={activeChart === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('monthly')}
            className="text-xs"
          >
            Monthly Trend
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          {activeChart === 'weekly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyUsageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="images" name="Images" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="videos" name="Videos" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="chats" name="Chats" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="audio" name="Audio" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {activeChart === 'models' && (
            <div className="flex items-center justify-center h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="space-y-2">
                  {modelUsageData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.name}: {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeChart === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="generations" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">342</p>
            <p className="text-xs text-muted-foreground">Total Images</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">89</p>
            <p className="text-xs text-muted-foreground">Videos Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">156</p>
            <p className="text-xs text-muted-foreground">Chat Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">45</p>
            <p className="text-xs text-muted-foreground">Audio Files</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}