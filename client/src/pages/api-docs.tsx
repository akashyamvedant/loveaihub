import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Code } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Comprehensive SDKs and detailed documentation for quick integration"
  }
];

export default function ApiDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [apiKey, setApiKey] = useState("");
  const [testPrompt, setTestPrompt] = useState("A beautiful sunset over mountains");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">API Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive documentation for integrating LoveAIHub's powerful AI APIs into your applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="glass-effect border-border card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4">
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle>API Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get started with our powerful AI APIs. Documentation and examples coming soon.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}