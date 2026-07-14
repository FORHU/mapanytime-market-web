import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, type UserRole } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

// Explicit parameters signature to handle your two-argument login API function
interface LoginVariables {
  credentials: Record<string, string>;
  roleName: UserRole;
}

interface RegisterVariables {
  userData: Record<string, string>;
  roleName: UserRole;
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

  const registerMutation = useMutation({
    mutationFn: ({ userData, roleName }: RegisterVariables) =>
      register(userData, roleName),
    onSuccess: (data) => {
      // register() returns an accessToken too — the backend logs the user in
      // immediately on signup, same as login.
      if (data.accessToken) setToken(data.accessToken);
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
    login: (credentials: Record<string, string>, roleName: UserRole) =>
      loginMutation.mutateAsync({ credentials, roleName }),
    register: (userData: Record<string, string>, roleName: UserRole) =>
      registerMutation.mutateAsync({ userData, roleName }),
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
