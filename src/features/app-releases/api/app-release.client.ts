import { env } from "@/shared/lib/env";
import { fetcher } from "@/shared/lib/http";
import type { AppReleaseInfo } from "@/config/app-release.config";

export interface AdminAppRelease extends AppReleaseInfo {
  id: string;
  status: "ACTIVE" | "DEPRECATED" | "FAILED";
  isLatest: boolean;
  forceUpdate: boolean;
  createdAt: string;
}

/**
 * The API's standard envelope, produced by responseSuccess/responseError on the server:
 * `{ status, statusCode, data, message? }`. The app-release endpoints used to hand-roll
 * `{ success, data }` instead, which is why this once checked only for `data` — `LiveHeroMap`
 * was meanwhile checking `status === "success"` against the same API.
 */
interface ApiEnvelope<T> {
  status?: "success" | "error";
  statusCode?: number;
  data?: T;
  message?: string;
}

/**
 * Public release endpoints are called from the landing page by signed-out visitors, so they
 * deliberately bypass `fetcher`: on any auth-shaped error fetcher clears tokens and hard-redirects
 * to /login, which would throw an anonymous visitor off the marketing page over a failed
 * background metadata fetch. A plain fetch that resolves to null lets the caller fall back.
 *
 * The base URL still comes from `env` — never read process.env outside shared/lib/env.ts.
 */
async function publicGet<T>(path: string): Promise<T | null> {
  try {
    // Trim any trailing slash on the configured base — `https://api.example.com/` + `/api/v1/…`
    // would otherwise produce a `//api/v1/…` path that some gateways 404.
    const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    const res = await fetch(`${base}${path}`, {
      headers: base.includes("ngrok")
        ? { "ngrok-skip-browser-warning": "true" }
        : undefined,
    });
    if (!res.ok) return null;

    const json: ApiEnvelope<T> = await res.json();
    if (json.status !== "success") return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * The API stores a timestamp (`createdAt`) but the UI wants a readable date. Mapping it here
 * keeps that translation in one place — previously nothing mapped it at all, so the modal fell
 * through to a hardcoded date and showed "August 6, 2026" for every release ever published.
 */
function withReleaseDate<T extends AppReleaseInfo>(release: T): T {
  if (!release.createdAt) return release;
  const parsed = new Date(release.createdAt);
  if (Number.isNaN(parsed.getTime())) return release;

  return {
    ...release,
    releaseDate: parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export async function fetchLatestRelease() {
  const release = await publicGet<AppReleaseInfo>("/api/v1/app/latest");
  return release ? withReleaseDate(release) : null;
}

export async function fetchReleaseHistory() {
  const history = await publicGet<AppReleaseInfo[]>("/api/v1/app/history");
  return history?.map(withReleaseDate) ?? null;
}

/* ── Admin ──────────────────────────────────────────────────────────────────
 * These go through `fetcher` so they inherit the shared auth header and the
 * 401 refresh-and-retry flow. */

export async function fetchAdminReleaseHistory() {
  const res = await fetcher<ApiEnvelope<AdminAppRelease[]>>(
    "/api/v1/admin/app-releases/history?includeFailed=true",
  );
  return res?.data ?? [];
}

export async function createRelease(payload: {
  version: string;
  buildNumber: number;
  channel: string;
  apkUrl: string;
  fileSize: string;
  minAndroidVersion: string;
  architecture: string;
  sha256?: string;
  whatsNew: string[];
  isLatest?: boolean;
  forceUpdate?: boolean;
}) {
  return fetcher<ApiEnvelope<AdminAppRelease>>("/api/v1/admin/app-releases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function rollbackRelease(id: string) {
  return fetcher<ApiEnvelope<unknown>>(
    `/api/v1/admin/app-releases/${id}/rollback`,
    { method: "POST" },
  );
}

export async function setLatestRelease(id: string) {
  return fetcher<ApiEnvelope<AdminAppRelease>>(
    `/api/v1/admin/app-releases/${id}/set-latest`,
    { method: "POST" },
  );
}
