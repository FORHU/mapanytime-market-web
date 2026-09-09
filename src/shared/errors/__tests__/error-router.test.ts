import { describe, it, expect } from "vitest";
import { routeError } from "@/shared/errors/error-router";
import { ApiError } from "@/shared/errors/api-error";

const apiError = (message: string, category: string, status: number) =>
  new ApiError(message, category as never, { status });

describe("routeError", () => {
  /**
   * The API knows whether a 401 means "wrong password" or "your session was revoked on
   * another device"; this layer only sees the status. It used to substitute the fixed
   * string "Session expired" for both, so a mistyped password was reported to the user
   * as an expired session.
   */
  it("shows the API's own message for an auth failure", () => {
    const result = routeError(
      apiError("Incorrect email or password.", "AUTH", 401),
    );

    expect(result.toast).toBe("Incorrect email or password.");
    expect(result.toast).not.toBe("Session expired");
  });

  it("shows the API's own message for a forbidden response", () => {
    const result = routeError(
      apiError("Your seller account is under review.", "FORBIDDEN", 403),
    );

    expect(result.toast).toBe("Your seller account is under review.");
    expect(result.toast).not.toBe("Access denied");
  });

  it("still signs the user out on an auth failure", () => {
    // Reading the message from the API must not change what the app *does*.
    expect(routeError(apiError("whatever", "AUTH", 401)).action).toBe("logout");
  });

  it("leaves validation errors to the form, with no toast", () => {
    const result = routeError(apiError("Check the fields", "VALIDATION", 422));

    expect(result.toast).toBeNull();
    expect(result.action).toBe("form");
  });

  it("supplies its own text only when there is no API error to read", () => {
    const result = routeError(new Error("boom"));

    expect(result.toast).toBe("Unexpected error occurred");
    expect(result.action).toBe("log");
  });
});
