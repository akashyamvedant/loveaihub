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
}

export const storage = new DatabaseStorage();
