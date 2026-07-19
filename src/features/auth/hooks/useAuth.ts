import {
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { login, logout, register, type UserRole } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

export function clearAuthSession(
  setToken: (token: string | null) => void,
  queryClient: QueryClient,
) {
  setToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("active_store_context_id");
  }
  queryClient.clear();
}

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
    mutationFn: async ({ userData, roleName }: RegisterVariables) => {
      const result = await register(userData, roleName);
      if (result.accessToken) return result;

      return login(
        { email: userData.email, password: userData.password },
        roleName,
      );
    },
    onSuccess: (data) => {
      if (data.accessToken) setToken(data.accessToken);
      queryClient.invalidateQueries();
    },
  });

  const clearSession = () => clearAuthSession(setToken, queryClient);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: clearSession,
    onError: clearSession,
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
