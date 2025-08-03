import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { authApi } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
  });

  const user = authData?.user;

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}

export function useSignUp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, firstName, lastName }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => authApi.signUp(email, password, firstName, lastName),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Account created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSignIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSignOut() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear(); // Clear all cache on logout
    },
    onError: (error) => {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (email: string) => authApi.resetPassword(email),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset email sent",
      });
    },
    onError: (error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
