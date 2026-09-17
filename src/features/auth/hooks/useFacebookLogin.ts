// src/features/auth/hooks/useFacebookLogin.ts
import { env } from "@/shared/lib/env";

type FacebookAuthResponse = {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
};

type FacebookStatusResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse: FacebookAuthResponse | null;
};

interface FacebookSdk {
  init: (params: {
    appId: string;
    version: string;
    cookie: boolean;
    xfbml: boolean;
  }) => void;
  getLoginStatus: (cb: (response: FacebookStatusResponse) => void) => void;
  login: (
    cb: (response: FacebookStatusResponse) => void,
    params: { scope: string },
  ) => void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";

let sdkReadyPromise: Promise<FacebookSdk> | null = null;

/**
 * Loads the Facebook JS SDK once, lazily, only when a caller actually tries to
 * sign in — not globally on every page load. `cookie`/`xfbml` are off: this app
 * never reads Facebook's own session cookie and renders no social plugins, only
 * ever trading a one-shot access token with the API.
 */
function loadFacebookSdk(appId: string): Promise<FacebookSdk> {
  if (sdkReadyPromise) return sdkReadyPromise;

  sdkReadyPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error("Facebook SDK failed to load."));
        return;
      }
      window.FB.init({
        appId,
        version: "v21.0",
        cookie: false,
        xfbml: false,
      });
      resolve(window.FB);
    };

    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () =>
      reject(new Error("Could not reach the Facebook SDK."));
    document.body.appendChild(script);
  });

  return sdkReadyPromise;
}

/**
 * Signs the visitor in with Facebook and resolves the access token the API
 * verifies server-side. Checks `FB.getLoginStatus` first, per Meta's documented
 * flow, so a visitor already connected to this app isn't re-prompted — only a
 * `not_authorized`/`unknown` status falls through to `FB.login()`.
 */
export function useFacebookLogin() {
  const appId = env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const loginWithFacebook = async (): Promise<string> => {
    if (!appId) {
      throw new Error("Facebook sign-in is not configured.");
    }

    const FB = await loadFacebookSdk(appId);

    const status = await new Promise<FacebookStatusResponse>((resolve) => {
      FB.getLoginStatus(resolve);
    });

    if (status.status === "connected" && status.authResponse) {
      return status.authResponse.accessToken;
    }

    const loginResponse = await new Promise<FacebookStatusResponse>(
      (resolve) => {
        FB.login(resolve, { scope: "public_profile,email" });
      },
    );

    if (loginResponse.status !== "connected" || !loginResponse.authResponse) {
      throw new Error("Facebook sign-in was cancelled.");
    }

    return loginResponse.authResponse.accessToken;
  };

  return { loginWithFacebook, isConfigured: Boolean(appId) };
}
