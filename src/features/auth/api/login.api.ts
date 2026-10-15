// src/features/auth/api/login.api.ts
import { fetcher } from "@/shared/lib/http";
import {
  LoginResponseEnvelopeSchema,
  AuthResultSchema,
  type AuthResult,
} from "../contracts/auth.contract";

// Unified type definitions
export type UserRole = "BUYER" | "SELLER" | "ADMIN" | "SUPPORT_AGENT";

interface AuthResponse {
  accessToken: string;
  hasStoreBranches?: boolean;
}

/**
 * Unified Unified Login Handler
 * Replaces both loginBuyer and loginSeller
 */
export const login = async (
  credentials: Record<string, string>,
  roleName: UserRole,
): Promise<AuthResult> => {
  const raw = await fetcher<unknown>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      roleName, // Injected dynamically ("BUYER" or "SELLER")
    }),
  });

  const envelope = LoginResponseEnvelopeSchema.parse(raw);
  return AuthResultSchema.parse({
    accessToken: envelope.data.accessToken,
    // Stores owned outright. Org staff own none — `orgContext` is what tells
    // us whether they nonetheless have stores to work in.
    hasStores: Array.isArray(envelope.data.stores)
      ? envelope.data.stores.length > 0
      : false,
    orgContext: envelope.data.orgContext,
    user: envelope.data.user,
    seller: envelope.data.seller,
  });
};

/**
 * Facebook Login.
 *
 * Sends only the access token the Facebook JS SDK produced — the API verifies
 * it against the Graph API and derives identity from that, never from
 * anything asserted here. See auth.service.ts's facebookLogin for why.
 */
export const loginWithFacebook = async (
  accessToken: string,
): Promise<AuthResult> => {
  const raw = await fetcher<unknown>("/api/v1/auth/facebook", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });

  const envelope = LoginResponseEnvelopeSchema.parse(raw);
  return AuthResultSchema.parse({
    accessToken: envelope.data.accessToken,
    hasStores: Array.isArray(envelope.data.stores)
      ? envelope.data.stores.length > 0
      : false,
    orgContext: envelope.data.orgContext,
    user: envelope.data.user,
    seller: envelope.data.seller,
  });
};

/**
 * Google Sign-In.
 *
 * Sends only the ID token Google Identity Services produced — the API
 * verifies its signature/audience/issuer against Google's own keys and
 * derives identity from that, never from anything asserted here.
 */
export const loginWithGoogle = async (idToken: string): Promise<AuthResult> => {
  const raw = await fetcher<unknown>("/api/v1/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  const envelope = LoginResponseEnvelopeSchema.parse(raw);
  return AuthResultSchema.parse({
    accessToken: envelope.data.accessToken,
    hasStores: Array.isArray(envelope.data.stores)
      ? envelope.data.stores.length > 0
      : false,
    orgContext: envelope.data.orgContext,
    user: envelope.data.user,
    seller: envelope.data.seller,
  });
};

/**
 * Unified Registration Handler
 * Replaces both registerBuyer and registerSeller
 */
export const register = async (
  userData: Record<string, string>,
  roleName: UserRole,
) => {
  const res = await fetcher<{ data: AuthResponse }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      roleName, // Injected dynamically ("BUYER" or "SELLER")
    }),
  });

  // Safe navigation in case your backend registration doesn't return data (like in your controller)
  return {
    accessToken: res?.data?.accessToken,
    hasStoreBranches: res?.data?.hasStoreBranches,
  };
};

/**
 * Exchange a one-time code for a password.
 *
 * Serves both shapes the API accepts: the 4-digit forgot-password OTP, and the
 * longer set-up code an admin hands a new staff member. The account already
 * exists in both cases — this only sets the credential.
 */
export const setPassword = async (input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> => {
  await fetcher<unknown>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

/**
 * Universal Global Logout Handler
 *
 * Ends the session the bearer token identifies — under Better Auth (API #122)
 * there is no refresh token to send. Idempotent: an already-ended session is a 200.
 */
export const logout = async () =>
  fetcher("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
