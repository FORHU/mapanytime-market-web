import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import { login, logout, register, type UserRole } from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";
import { clearClientSession } from "@/shared/lib/session";

export function clearAuthSession(
  setToken: (token: string | null) => void,
  queryClient: QueryClient,
) {
  // setToken(null) first so the zustand store updates and subscribed components
  // re-render; clearClientSession then covers everything storage-side, including
  // the analytics session id that used to outlive the credential.
  setToken(null);
  clearClientSession();
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
    // Before setToken, not after — clearClientSession() clears the credential too,
    // so the reverse order would wipe the token just written. Signing in has to
    // tear down first because a tab whose session expired without an explicit
    // logout arrives at /login still holding the previous user's analytics id and
    // seller context.
    clearClientSession();
    setToken(accessToken, refreshToken);
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
