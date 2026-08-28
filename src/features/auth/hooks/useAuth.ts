import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { login, logout, register, type UserRole } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";

/**
 * Per-user state that must not survive a session change, keyed by storage.
 * Kept in one place because login and logout previously cleared different subsets —
 * logout dropped only the store context, so the property context leaked across users.
 */
const SCOPED_STORAGE_KEYS = [
  "active_store_context_id",
  "active_property_context_id",
] as const;

function clearScopedStorage() {
  if (typeof window === "undefined") return;
  SCOPED_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function clearAuthSession(
  setToken: (token: string | null) => void,
  queryClient: QueryClient,
) {
  setToken(null);
  clearScopedStorage();
  queryClient.clear();
}

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

  /**
   * `clear()` rather than `invalidateQueries()`. Invalidating marks entries stale but
   * leaves them in memory, so the incoming user could be shown the previous user's
   * cached data for the moment before each refetch lands.
   */
  const adoptSession = (accessToken: string, refreshToken?: string) => {
    setToken(accessToken, refreshToken);
    clearScopedStorage();
    queryClient.clear();
  };

  const loginMutation = useSafeMutation({
    mutationFn: ({ credentials, roleName }: LoginVariables) =>
      login(credentials, roleName),
    // A 401 here means "wrong password", not "your session ended". Without this the
    // global handler would sign the user out and redirect mid-login. The form renders
    // the error itself.
    meta: { skipGlobalErrorHandling: true },
    onSuccess: (data) => adoptSession(data.accessToken, data.refreshToken),
  });

  const registerMutation = useSafeMutation({
    mutationFn: async ({ userData, roleName }: RegisterVariables) => {
      const result = await register(userData, roleName);
      if (result.accessToken) return result;

      return login(
        { email: userData.email, password: userData.password },
        roleName,
      );
    },
    meta: { skipGlobalErrorHandling: true },
    onSuccess: (data) => {
      if (!data.accessToken) return;
      // `register` and the login fallback return different shapes; only one carries a
      // refresh token. Narrowing beats the `as any` this replaced — a missing refresh
      // token is legitimate here, an untyped one hides the day the shape changes.
      const refreshToken =
        "refreshToken" in data ? data.refreshToken : undefined;
      adoptSession(data.accessToken, refreshToken);
    },
  });

  const clearSession = () => clearAuthSession(setToken, queryClient);

  const logoutMutation = useSafeMutation({
    mutationFn: logout,
    // `onSettled`, so local state is cleared whether or not the call succeeded. The
    // alternative — staying signed in on the client after a failed request — is worse:
    // the server may well have revoked the session anyway, and a Sign Out button that
    // visibly does nothing is not a state the user can recover from.
    onSettled: clearSession,
  });

  return {
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
