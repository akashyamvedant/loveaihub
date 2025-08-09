import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Debug() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testA4FConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-a4f');
      const result = await response.json();
      addResult('A4F Connection Test', result);
      
      if (result.success) {
        toast({
          title: "A4F Connection Test",
          description: "✅ A4F API connection successful",
        });
      } else {
        toast({
          title: "A4F Connection Test",
          description: "❌ A4F API connection failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      addResult('A4F Connection Test', { error: (error as Error).message });
      toast({
        title: "A4F Connection Test",
        description: "❌ Test failed with error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-auth', {
        credentials: 'include'
      });
      const result = await response.json();
      addResult('Authentication Test', result);
      
      if (result.success) {
        toast({
          title: "Authentication Test",
          description: "✅ Authentication successful",
        });
      } else {
        toast({
          title: "Authentication Test",
          description: "❌ Authentication failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      addResult('Authentication Test', { error: (error as Error).message });
      toast({
        title: "Authentication Test",
        description: "❌ Authentication test failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const result = await response.json();
      addResult('Image Generation Test', result);
      
      if (result.success) {
        toast({
          title: "Image Generation Test",
          description: "✅ Image generation successful",
        });
      } else {
        toast({
          title: "Image Generation Test",
          description: "❌ Image generation failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      addResult('Image Generation Test', { error: (error as Error).message });
      toast({
        title: "Image Generation Test",
        description: "❌ Image generation test failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Debug & Testing</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Test and debug various API endpoints and functionality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Controls */}
            <div>
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle>API Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={testA4FConnection}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    Test A4F API Connection
                  </Button>
                  
                  <Button
                    onClick={testAuthentication}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    Test Authentication
                  </Button>
                  
                  <Button
                    onClick={testImageGeneration}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    Test Image Generation
                  </Button>
                  
                  <Button
                    onClick={clearResults}
                    variant="destructive"
                    className="w-full"
                  >
                    Clear Results
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Test Results */}
            <div>
              <Card className="glass-effect border-border">
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {testResults.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No test results yet. Run some tests to see results here.
                      </p>
                    ) : (
                      testResults.map((result, index) => (
                        <div key={index} className="border border-slate-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{result.test}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <Textarea
                            value={JSON.stringify(result.result, null, 2)}
                            readOnly
                            className="min-h-[100px] bg-slate-800 text-xs font-mono"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
