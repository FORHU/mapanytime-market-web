import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { useSafeMutation } from "@/shared/query/useSafeMutation";
import {
  login,
  loginWithFacebook,
  loginWithGoogle,
  logout,
  register,
  type UserRole,
} from "../api/login.api";
import { useAuthStore } from "../stores/auth.store";
import { clearClientSession } from "@/shared/lib/session";
import { claimSignOut } from "@/shared/lib/session-state";

export function clearAuthSession(
  setToken: (token: string | null) => void,
  queryClient: QueryClient,
) {
  // Latch first. Our own in-flight requests are about to answer 401; the
  // dispatch sites in http.ts and query-provider.tsx read this latch and stay
  // quiet, which is what stops those 401s from triggering another teardown.
  claimSignOut();

  // Credential first. Removing a query does not stop it: the next render
  // rebuilds the cache entry and `setOptions` refetches it unless `enabled` has
  // already gone false, and only dropping the token makes that happen.
  //
  // The order relative to the clear below is presentational rather than
  // load-bearing — every line here runs synchronously before React can render,
  // so what actually matters is that the credential is gone by the time it
  // does. Written in causal order anyway, because the next reader will assume
  // it matters.
  setToken(null);
  clearClientSession();

  // Abort what is already in flight so it never reaches QueryCache.onError.
  // The default `revert: true` matters: a reverted cancellation skips the error
  // dispatch entirely, so tearing down produces no phantom toast.
  queryClient.cancelQueries();

  // getQueryCache().clear(), not queryClient.clear() — the latter also wipes the
  // mutation cache, and this runs inside the logout mutation's own onSettled.
  queryClient.getQueryCache().clear();
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
    // getQueryCache().clear() rather than queryClient.clear(): this runs inside
    // the login mutation's own onSuccess, and clear() would wipe the mutation
    // cache out from under it.
    queryClient.getQueryCache().clear();
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

  const facebookLoginMutation = useSafeMutation({
    mutationFn: (accessToken: string) => loginWithFacebook(accessToken),
    // Same reasoning as loginMutation: a rejection here is a form-level
    // sign-in failure, not a session expiring mid-app.
    meta: { skipGlobalErrorHandling: true },
    onSuccess: (data) => adoptSession(data.accessToken, data.refreshToken),
  });

  const googleLoginMutation = useSafeMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
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
    loginWithFacebook: (accessToken: string) =>
      facebookLoginMutation.mutateAsync(accessToken),
    loginWithGoogle: (idToken: string) =>
      googleLoginMutation.mutateAsync(idToken),
    register: (userData: Record<string, string>, roleName: UserRole) =>
      registerMutation.mutateAsync({ userData, roleName }),
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingInWithFacebook: facebookLoginMutation.isPending,
    isLoggingInWithGoogle: googleLoginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
