import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

// Explicit parameters signature to handle your two-argument login API function
interface LoginVariables {
  credentials: Record<string, string>;
  roleName: any;
}

export function useAuth() {
  const setToken = useAuthStore((state) => state.setToken);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    // Pack variables into a single object argument for TanStack Query
    mutationFn: ({ credentials, roleName }: LoginVariables) =>
      login(credentials, roleName),
    onSuccess: (data) => {
      // ✅ FIX: Using data.accessToken matching your api return types schema
      setToken(data.accessToken);
      queryClient.invalidateQueries();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setToken(null);
      queryClient.clear();
    },
    onError: () => {
      setToken(null);
      queryClient.clear();
    },
  });

  return {
    // ✅ FIX: Wrap mutateAsync so components can still call it clean as login(credentials, role)
    login: (credentials: Record<string, string>, roleName: any) =>
      loginMutation.mutateAsync({ credentials, roleName }),
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
