"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { env } from "@/shared/lib/env";
import { useAuth } from "../hooks/useAuth";
import type { AuthResult } from "../contracts/auth.contract";

type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

interface GoogleAccountsId {
  initialize: (params: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const SDK_SRC = "https://accounts.google.com/gsi/client";
let sdkReadyPromise: Promise<void> | null = null;

/** Loads the Google Identity Services script once, lazily. */
function loadGoogleSdk(): Promise<void> {
  if (sdkReadyPromise) return sdkReadyPromise;

  sdkReadyPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    if (document.getElementById("google-identity-services")) {
      // Another mount already kicked off the load; poll briefly for it.
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not reach Google Sign-In."));
    document.body.appendChild(script);
  });

  return sdkReadyPromise;
}

/**
 * Renders Google's own Sign In button — not a custom one. Google's branding
 * guidelines don't allow disguising this button behind arbitrary styling the
 * way the Facebook button here is custom-drawn, so this only themes it
 * (outline for light, filled for dark) rather than reskinning it.
 */
export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess: (result: AuthResult) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !mounted || !containerRef.current) return;

    let cancelled = false;

    loadGoogleSdk()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const result = await loginWithGoogle(response.credential);
              onSuccess(result);
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "Google sign-in failed.",
              );
            }
          },
        });

        // Cleared first so a theme change re-renders instead of stacking a
        // second button below the first.
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: "336",
        });
      })
      .catch(() => {
        // No SDK, no button — the password form still works.
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, resolvedTheme, loginWithGoogle, onSuccess]);

  if (!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="flex justify-center mt-3" />;
}
