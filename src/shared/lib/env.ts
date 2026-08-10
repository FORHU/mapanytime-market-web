import { z } from "zod";

/**
 * FAOS — Environment Validation
 *
 * All environment variables must be declared here and validated via Zod.
 * The app will throw a clear error at startup if any required var is missing.
 * Never access `process.env` directly outside of this file.
 *
 * Usage: import { env } from "@/shared/lib/env";
 */
const envSchema = z.object({
  // ── API ──────────────────────────────────────────────────────────────────
  /** Base URL of the backend REST API. Must be a valid URL. */
  NEXT_PUBLIC_API_URL: z
    .string({ error: "NEXT_PUBLIC_API_URL is required." })
    .url({
      message:
        "NEXT_PUBLIC_API_URL must be a valid URL (e.g. https://api.example.com).",
    }),

  // ── Site ─────────────────────────────────────────────────────────────────
  /** Canonical public URL of this frontend (used for OG tags, sitemap). Optional in dev. */
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_SITE_URL must be a valid URL." })
    .optional(),

  // ── Realtime ─────────────────────────────────────────────────────────────
  /**
   * Socket.IO server. Hosted by the API process, so it is the same origin as
   * NEXT_PUBLIC_API_URL and defaults to it — a separate value is only needed if realtime is
   * split onto its own host.
   *
   * This is inlined at build time (NEXT_PUBLIC_*), so it must be passed as a Docker build arg,
   * not a runtime variable. It previously lived outside this file behind a
   * `process.env.X || "http://localhost:4002"` fallback: when the build arg was missing the
   * production bundle silently pointed every browser at its own machine, so the socket could
   * never connect and nothing failed loudly enough to notice.
   */
  NEXT_PUBLIC_SOCKET_SERVER_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_SOCKET_SERVER_URL must be a valid URL." })
    .optional(),

  // ── Mapbox ────────────────────────────────────────────────────────────────
  /**
   * Public (pk.*) Mapbox token. Inlined at build time, so it must be a Docker build arg.
   * Optional so a build without maps still boots, but the landing-page map silently renders
   * blank without it — which is exactly the failure mode this file exists to make loud.
   */
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().optional(),

  // ── Feature Flags ─────────────────────────────────────────────────────────
  /** Runtime environment name. Drives feature flag defaults. */
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production"], {
      error:
        "NEXT_PUBLIC_APP_ENV must be one of: development, staging, production.",
    })
    .default("development"),
});

/**
 * Parsed, type-safe environment configuration.
 * Throws at module load time if validation fails — surfacing config issues early.
 */
function createEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SOCKET_SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });

  if (!result.success) {
    console.error("\n❌ Invalid environment configuration detected:\n");
    result.error.issues.forEach((issue) => {
      console.error(`  • [${issue.path.join(".")}]: ${issue.message}`);
    });
    console.error(
      "\n📄 Copy .env.example to .env.local and fill in the required values.\n",
    );
    throw new Error("Environment validation failed. See above for details.");
  }

  const parsed = result.data;

  // Realtime lives in the API process, so the API origin is the right default. Falling back to
  // it (rather than to a hardcoded localhost) means a missing build arg degrades to the correct
  // host instead of pointing production browsers at their own machine.
  const socketUrl =
    parsed.NEXT_PUBLIC_SOCKET_SERVER_URL || parsed.NEXT_PUBLIC_API_URL;

  // Browsers refuse ws:// from an https:// page. Catch the mismatch at startup rather than
  // leaving it as a silent connection failure with nothing in the server logs.
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    socketUrl.startsWith("http://")
  ) {
    console.error(
      `[env] NEXT_PUBLIC_SOCKET_SERVER_URL is ${socketUrl} but the page is served over HTTPS. ` +
        `The browser will block this as mixed content and the socket will never connect. ` +
        `Use an https:// URL.`,
    );
  }

  return { ...parsed, NEXT_PUBLIC_SOCKET_SERVER_URL: socketUrl };
}

export const env = createEnv();

export type Env = z.infer<typeof envSchema>;
