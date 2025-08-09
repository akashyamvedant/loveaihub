interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayClient {
  private static instance: RazorpayClient;
  private razorpayLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): RazorpayClient {
    if (!RazorpayClient.instance) {
      RazorpayClient.instance = new RazorpayClient();
    }
    return RazorpayClient.instance;
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.razorpayLoaded || window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  async initiatePayment(options: RazorpayOptions): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();
    
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    const razorpayOptions = {
      key: options.key || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_2kYJDdAef2pyQP',
      amount: options.amount,
      currency: options.currency || 'USD',
      name: options.name || 'LoveAIHub',
      description: options.description,
      order_id: options.order_id,
      handler: options.handler,
      prefill: options.prefill || {},
      notes: options.notes || {},
      theme: {
        color: options.theme?.color || '#6366f1',
      },
      modal: {
        ondismiss: options.modal?.ondismiss,
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
  }

  async createSubscription(planType: 'premium' | 'enterprise', userDetails: {
    name: string;
    email: string;
    contact?: string;
  }): Promise<void> {
    const plans = {
      premium: {
        amount: 500, // $5 in cents
        description: 'LoveAIHub Premium - Unlimited AI Access',
      },
      enterprise: {
        amount: 5000, // $50 in cents  
        description: 'LoveAIHub Enterprise - Custom Solutions',
      },
    };

    const plan = plans[planType];

    return this.initiatePayment({
      key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_2kYJDdAef2pyQP',
      amount: plan.amount,
      currency: 'USD',
      name: 'LoveAIHub',
      description: plan.description,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      },
      notes: {
        plan_type: planType,
        service: 'LoveAIHub Subscription',
      },
      handler: (response: RazorpayResponse) => {
        console.log('Payment successful:', response);
        // Handle successful payment
        this.handlePaymentSuccess(response, planType);
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled by user');
        },
      },
    });
  }

  private async handlePaymentSuccess(response: RazorpayResponse, planType: string) {
    try {
      // Send payment details to backend for verification
      const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          plan_type: planType,
        }),
      });

      if (verificationResponse.ok) {
        // Payment verified successfully
        window.location.href = '/dashboard?payment=success';
      } else {
        // Payment verification failed
        window.location.href = '/dashboard?payment=failed';
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      window.location.href = '/dashboard?payment=error';
    }
  }

  async createOrder(amount: number, currency: string = 'USD'): Promise<string> {
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data.order_id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Utility method for one-time payments
  async makePayment(amount: number, description: string, userDetails: {
    name: string;
    email: string;
    contact?: string;
  }): Promise<void> {
    const orderId = await this.createOrder(amount);

    return this.initiatePayment({
      key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_2kYJDdAef2pyQP',
      amount: amount,
      currency: 'USD',
      name: 'LoveAIHub',
      description: description,
      order_id: orderId,
      prefill: userDetails,
      handler: (response: RazorpayResponse) => {
        this.handlePaymentSuccess(response, 'one-time');
      },
    });
  }
}

export const razorpayClient = RazorpayClient.getInstance();

// Helper function to format amount for Razorpay (convert dollars to cents)
export const formatAmountForRazorpay = (amountInDollars: number): number => {
  return Math.round(amountInDollars * 100);
};

// Helper function to validate Razorpay environment
export const validateRazorpayConfig = (): boolean => {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  return Boolean(keyId);
};

// Export types for use in components
export type { RazorpayOptions, RazorpayResponse };
