import { useAuth } from "@/hooks/useAuth";
import { authStorage } from "@/lib/authStorage";
import { authRefresh } from "@/lib/authRefresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function AuthDebug() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkAuthState = () => {
    const token = authStorage.getToken();
    const hasAuth = authStorage.hasAuth();
    
    console.log("=== AUTH DEBUG ===");
    console.log("User:", user);
    console.log("Is Authenticated:", isAuthenticated);
    console.log("Is Loading:", isLoading);
    console.log("Stored Token:", token ? token.substring(0, 20) + "..." : "None");
    console.log("Has Auth:", hasAuth);
    console.log("Session Storage:", JSON.stringify(sessionStorage));
    console.log("Local Storage Auth Keys:", Object.keys(localStorage).filter(k => k.includes('auth')));
    
    toast({
      title: "Auth Debug",
      description: `Authenticated: ${isAuthenticated}, Token: ${token ? 'Present' : 'Missing'}`,
    });
  };

  const testAPICall = async () => {
    try {
      const token = authStorage.getToken();
      console.log("Testing API call with token:", token ? token.substring(0, 20) + "..." : "None");
      
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      console.log("API Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result);
      
      toast({
        title: "API Test Result",
        description: `Status: ${response.status}, Success: ${response.ok}`,
        variant: response.ok ? "default" : "destructive"
      });
    } catch (error) {
      console.error("API Test Error:", error);
      toast({
        title: "API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-effect border-border max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs space-y-1">
          <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
          <div>Loading: {isLoading ? "⏳" : "✅"}</div>
          <div>User ID: {user?.id || "None"}</div>
          <div>User Email: {user?.email || "None"}</div>
          <div>Token: {authStorage.getToken() ? "Present" : "Missing"}</div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button onClick={checkAuthState} size="sm" variant="outline">
            Debug
          </Button>
          <Button onClick={testAPICall} size="sm" variant="outline">
            Test API
          </Button>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              toast({ title: "Auth Refreshed", description: "Authentication queries refreshed" });
            }}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            onClick={() => authRefresh.forceReauth()}
            size="sm"
            variant="destructive"
          >
            Re-auth
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
