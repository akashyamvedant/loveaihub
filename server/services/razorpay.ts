import Razorpay from "razorpay";

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_2kYJDdAef2pyQP",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "0KIYQ2tCGiWRwyRgXT1SxJla",
    });
  }

  async createSubscription(planId: string, customerId?: string) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        quantity: 1,
        total_count: 12, // 12 months
        addons: [],
        notes: {
          service: "LoveAIHub Premium",
        },
      });

      return subscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error("Failed to create subscription");
    }
  }

  async createCustomer(email: string, name: string) {
    try {
      const customer = await this.razorpay.customers.create({
        name,
        email,
        contact: "",
        notes: {
          service: "LoveAIHub",
        },
      });

      return customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  async createPlan() {
    try {
      const plan = await this.razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: "LoveAIHub Premium",
          amount: 500, // $5 in cents
          currency: "USD",
          description: "Unlimited access to all AI models",
        },
      });

      return plan;
    } catch (error) {
      console.error("Error creating plan:", error);
      throw new Error("Failed to create plan");
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, true);
      return subscription;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.razorpay.subscriptions.fetch(subscriptionId);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw new Error("Failed to fetch subscription");
    }
  }

  async verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
