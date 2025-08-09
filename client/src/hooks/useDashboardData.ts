import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalGenerations: number;
  generationsUsed: number;
  generationsLimit: number;
  subscriptionType: string;
  recentCompletions: number;
  generationsByType: Record<string, number>;
}

export interface ActivityItem {
  id: string;
  type: 'image' | 'video' | 'chat' | 'audio' | 'transcription' | 'image_edit';
  model: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  metadata?: any;
  createdAt: string;
}

export interface AnalyticsData {
  period: string;
  dailyStats: Array<{
    date: string;
    type: string;
    count: number;
  }>;
  modelStats: Array<{
    model: string;
    count: number;
  }>;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentActivity(limit: number = 10) {
  return useQuery<ActivityItem[]>({
    queryKey: ["/api/dashboard/recent-activity", { limit }],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserAnalytics(period: string = "7days") {
  return useQuery<AnalyticsData>({
    queryKey: ["/api/dashboard/analytics", { period }],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGenerationHistory() {
  return useQuery<ActivityItem[]>({
    queryKey: ["/api/generations"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}