import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  Globe,
  Headphones,
  Code,
  Users,
  Building,
  ArrowRight
} from "lucide-react";

const features = {
  free: [
    "50 AI generations per month",
    "Access to all AI models",
    "Standard image quality",
    "Basic chat functionality",
    "Community support",
    "API access (limited)",
  ],
  premium: [
    "Unlimited AI generations",
    "Access to all premium models",
    "HD image quality",
    "Advanced AI chat with tools",
    "Priority processing",
    "Full API access",
    "Priority support",
    "Advanced analytics",
    "Custom model fine-tuning",
  ],
  enterprise: [
    "Everything in Premium",
    "Custom model deployment",
    "Dedicated infrastructure",
    "SLA guarantees",
    "Custom integrations",
    "White-label solutions",
    "Dedicated account manager",
    "Custom billing",
  ]
};

const useCases = [
  {
    icon: Users,
    title: "Content Creators",
    description: "Generate stunning visuals, videos, and audio content for social media, marketing, and entertainment.",
    plan: "Premium"
  },
  {
    icon: Code,
    title: "Developers",
    description: "Integrate AI capabilities into your applications with our comprehensive APIs and SDKs.",
    plan: "Premium"
  },
  {
    icon: Building,
    title: "Enterprises",
    description: "Scale AI across your organization with custom solutions, dedicated support, and enterprise features.",
    plan: "Enterprise"
  }
];

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate billing accordingly."
  },
  {
    question: "What happens if I exceed my generation limit?",
    answer: "Free users are limited to 50 generations per month. Premium users have unlimited generations. We'll notify you when approaching limits."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
  },
  {
    question: "Is there an API rate limit?",
    answer: "Free plans have limited API access. Premium plans include full API access with higher rate limits. Enterprise plans offer custom limits."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime. Your plan will remain active until the end of your current billing period."
  }
];

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const prices = {
    premium: {
      monthly: 5,
      yearly: 50
    },
    enterprise: {
      monthly: 50,
      yearly: 500
    }
  };

  const yearlyDiscount = billingPeriod === "yearly" ? 17 : 0; // ~17% discount for yearly

  const handleSubscribe = (plan: string) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    if (plan === "enterprise") {
      // For enterprise, redirect to contact
      window.open("mailto:enterprise@loveaihub.com", "_blank");
      return;
    }
    
    // For premium, integrate with Razorpay
    console.log(`Subscribing to ${plan} plan (${billingPeriod})`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              <span className="gradient-text">Simple, Transparent Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free with 50 generations, then upgrade for unlimited access to all AI models
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Label htmlFor="billing" className={billingPeriod === "monthly" ? "text-white" : "text-muted-foreground"}>
                Monthly
              </Label>
              <Switch
                id="billing"
                checked={billingPeriod === "yearly"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
              />
              <Label htmlFor="billing" className={billingPeriod === "yearly" ? "text-white" : "text-muted-foreground"}>
                Yearly
              </Label>
              {billingPeriod === "yearly" && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Save {yearlyDiscount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Free Plan */}
            <Card className="glass-effect border-border card-hover">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-slate-700 rounded-2xl mb-4 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl mb-2">Free Starter</CardTitle>
                <div className="text-4xl font-bold mb-2">$0</div>
                <p className="text-muted-foreground">Perfect for trying out our platform</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe("free")}
                  variant="outline"
                  className="w-full btn-secondary"
                  size="lg"
                >
                  {isAuthenticated && user?.subscriptionType === "free" ? "Current Plan" : "Get Started Free"}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="glass-effect border-2 border-primary/50 card-hover relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-2">
                  Most Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl mb-4 flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Premium Unlimited</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  ${billingPeriod === "monthly" ? prices.premium.monthly : Math.round(prices.premium.yearly / 12)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{billingPeriod === "monthly" ? "month" : "month"}
                  </span>
                </div>
                {billingPeriod === "yearly" && (
                  <div className="text-sm text-muted-foreground">
                    Billed annually (${prices.premium.yearly}/year)
                  </div>
                )}
                <p className="text-muted-foreground">Unlimited everything for creators</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {features.premium.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe("premium")}
                  className="w-full btn-primary"
                  size="lg"
                >
                  {isAuthenticated && user?.subscriptionType === "premium" ? "Current Plan" : "Upgrade to Premium"}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="glass-effect border-border card-hover">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 flex items-center justify-center mx-auto">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-muted-foreground">For teams and organizations</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {features.enterprise.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe("enterprise")}
                  variant="outline"
                  className="w-full btn-secondary"
                  size="lg"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Comparison */}
          <div className="mb-16">
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Why Choose <span className="gradient-text">LoveAIHub</span>?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center mx-auto">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">20+ AI Models</h3>
                    <p className="text-sm text-muted-foreground">Access the latest models from OpenAI, Anthropic, Google, and more</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg mb-4 flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Enterprise Security</h3>
                    <p className="text-sm text-muted-foreground">SOC 2 compliant with end-to-end encryption</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-lg mb-4 flex items-center justify-center mx-auto">
                      <Globe className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Global Infrastructure</h3>
                    <p className="text-sm text-muted-foreground">99.9% uptime with worldwide edge locations</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg mb-4 flex items-center justify-center mx-auto">
                      <Headphones className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-2">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">Expert support team ready to help you succeed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Perfect for <span className="gradient-text">Every Use Case</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="glass-effect border-border card-hover">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                      <useCase.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{useCase.title}</h3>
                    <p className="text-muted-foreground mb-6">{useCase.description}</p>
                    <Badge variant="secondary" className="mb-4">
                      Recommended: {useCase.plan}
                    </Badge>
                    <Button
                      onClick={() => handleSubscribe(useCase.plan.toLowerCase())}
                      className="w-full btn-primary"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="glass-effect border-border">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="glass-effect border-border max-w-4xl mx-auto">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of creators and developers using LoveAIHub to build amazing AI-powered applications.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => handleSubscribe("free")}
                    variant="outline"
                    className="btn-secondary"
                    size="lg"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    onClick={() => handleSubscribe("premium")}
                    className="btn-primary"
                    size="lg"
                  >
                    Go Premium Now
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  No credit card required • Cancel anytime • 30-day money-back guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
