import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function ApiDocs() {
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4">
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle>API Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p>API documentation content will be here.</p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Documentation
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