import {
  users,
  generations,
  blogPosts,
  subscriptions,
  type User,
  type UpsertUser,
  type Generation,
  type InsertGeneration,
  type BlogPost,
  type InsertBlogPost,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser & { id?: string }): Promise<User>;
  updateUserGenerationsUsed(userId: string, used: number): Promise<void>;
  
  // Generation operations
  createGeneration(generation: InsertGeneration & { userId: string }): Promise<Generation>;
  getGenerationsByUser(userId: string): Promise<Generation[]>;
  updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation | undefined>;
  
  // Blog operations
  createBlogPost(post: InsertBlogPost & { authorId: string }): Promise<BlogPost>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserGenerationsLimit(userId: string, limit: number): Promise<void>;
  getUsageStats(): Promise<any>;
  
  // Dashboard operations
  getUserDashboardStats(userId: string): Promise<any>;
  getRecentActivity(userId: string, limit: number): Promise<Generation[]>;
  getUserAnalytics(userId: string, period: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser & { id?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserGenerationsUsed(userId: string, used: number): Promise<void> {
    await db
      .update(users)
      .set({ generationsUsed: used, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Generation operations
  async createGeneration(generation: InsertGeneration & { userId: string }): Promise<Generation> {
    const [newGeneration] = await db
      .insert(generations)
      .values(generation)
      .returning();
    return newGeneration;
  }

  async getGenerationsByUser(userId: string): Promise<Generation[]> {
    return await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt));
  }

  async updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation | undefined> {
    const [updated] = await db
      .update(generations)
      .set(updates)
      .where(eq(generations.id, id))
      .returning();
    return updated;
  }

  // Blog operations
  async createBlogPost(post: InsertBlogPost & { authorId: string }): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    
    if (post) {
      // Increment view count
      await db
        .update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, post.id));
    }
    
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [updated] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Subscription operations
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserGenerationsLimit(userId: string, limit: number): Promise<void> {
    await db
      .update(users)
      .set({ generationsLimit: limit })
      .where(eq(users.id, userId));
  }

  async getUsageStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
    const totalGenerations = await db.select({ count: sql`count(*)` }).from(generations);
    const activeSubscriptions = await db
      .select({ count: sql`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    return {
      totalUsers: totalUsers[0].count,
      totalGenerations: totalGenerations[0].count,
      activeSubscriptions: activeSubscriptions[0].count,
    };
  }

  // Dashboard operations implementation
  async getUserDashboardStats(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Get generation counts by type
    const generationCounts = await db
      .select({
        type: generations.type,
        count: sql<number>`count(*)`
      })
      .from(generations)
      .where(eq(generations.userId, userId))
      .groupBy(generations.type);

    // Get total generations
    const totalGenerations = generationCounts.reduce((sum, item) => sum + item.count, 0);

    // Get recent completions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCompletions = await db
      .select({ count: sql<number>`count(*)` })
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          sql`${generations.createdAt} >= ${sevenDaysAgo}`,
          eq(generations.status, 'completed')
        )
      );

    return {
      totalGenerations,
      generationsUsed: user.generationsUsed || 0,
      generationsLimit: user.generationsLimit || 50,
      subscriptionType: user.subscriptionType || 'free',
      recentCompletions: recentCompletions[0].count,
      generationsByType: generationCounts.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<Generation[]> {
    const activities = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt))
      .limit(limit);
    
    return activities;
  }

  async getUserAnalytics(userId: string, period: string): Promise<any> {
    const days = period === '30days' ? 30 : period === '7days' ? 7 : 1;
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    // Get daily generation counts
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${generations.createdAt})`,
        type: generations.type,
        count: sql<number>`count(*)`
      })
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          sql`${generations.createdAt} >= ${periodStart}`
        )
      )
      .groupBy(sql`DATE(${generations.createdAt})`, generations.type)
      .orderBy(sql`DATE(${generations.createdAt})`);

    // Get model usage stats
    const modelStats = await db
      .select({
        model: generations.model,
        count: sql<number>`count(*)`
      })
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          sql`${generations.createdAt} >= ${periodStart}`
        )
      )
      .groupBy(generations.model)
      .orderBy(desc(sql`count(*)`));

    return {
      period,
      dailyStats,
      modelStats
    };
  }
}

export const storage = new DatabaseStorage();
