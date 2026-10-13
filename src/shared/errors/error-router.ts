import { ApiError } from "./api-error";

/**
 * Decides what the app does with an error, not what it says about it.
 *
 * The message belongs to the API. It knows whether a 401 means "wrong password" or
 * "your session was revoked on another device"; this layer only sees the status. The
 * AUTH and FORBIDDEN branches used to substitute fixed strings ("Session expired",
 * "Access denied"), which threw away the real reason — a mistyped password was
 * reported to the user as an expired session.
 *
 * Only the non-ApiError fallback still supplies its own text, because in that case
 * there is no server message to show.
 */
export function routeError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return {
      toast: "Unexpected error occurred",
      action: "log",
    };
  }

  switch (error.category) {
    case "AUTH":
      return {
        toast: error.message,
        action: "logout",
      };

    case "FORBIDDEN":
      return {
        toast: error.message,
        action: "none",
      };

    case "VALIDATION":
      return {
        toast: null,
        action: "form",
      };

    case "NETWORK":
      return {
        toast: "Network connection issue",
        action: "retryable",
      };

    default:
      return {
        toast: error.message,
        action: "log",
      };
  }
}
