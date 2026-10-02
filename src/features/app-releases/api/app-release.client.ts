import { env } from "@/shared/lib/env";
import { fetcher } from "@/shared/lib/http";
import type {
  AdminRelease,
  CreateReleasePayload,
  LatestReleaseResponse,
  PublicRelease,
  UpdateReleasePayload,
  UploadUrlResponse,
} from "../contracts/app-release.contract";

/**
 * The API's standard envelope, produced by responseSuccess/responseError on the server:
 * `{ status, statusCode, data, message? }`.
 */
interface ApiEnvelope<T> {
  status?: "success" | "error";
  statusCode?: number;
  data?: T;
  message?: string;
}

/** The API base with any trailing slash trimmed, so paths never become `//api/v1/…`. */
function apiBase() {
  return env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
}

/**
 * Public release endpoints are called from the landing page by signed-out visitors, so they
 * deliberately bypass `fetcher`: on any auth-shaped error fetcher clears tokens and hard-redirects
 * to /login, which would throw an anonymous visitor off the marketing page over a failed
 * background metadata fetch. A plain fetch that resolves to null lets the caller fall back.
 */
async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const base = apiBase();
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

/* ── Public ─────────────────────────────────────────────────────────────── */

/**
 * The install link. Stable on purpose — it names no version and no storage path: the API looks up
 * whichever version an admin made downloadable and redirects to a short-lived S3 URL for it. Safe
 * to put in buttons and QR codes, because it never expires.
 */
export function getApkDownloadUrl(): string {
  return `${apiBase()}/api/v1/app/download`;
}

export async function fetchLatestRelease(): Promise<LatestReleaseResponse> {
  const data = await publicGet<LatestReleaseResponse>("/api/v1/app/latest");
  return data ?? { available: false, release: null };
}

export async function fetchReleaseHistory(): Promise<PublicRelease[]> {
  return (await publicGet<PublicRelease[]>("/api/v1/app/history")) ?? [];
}

/* ── Admin ──────────────────────────────────────────────────────────────────
 * These go through `fetcher` so they inherit the shared auth header and the
 * 401 refresh-and-retry flow. */

const ADMIN_BASE = "/api/v1/admin/app-releases";

export async function fetchAdminReleases(): Promise<AdminRelease[]> {
  const res = await fetcher<ApiEnvelope<AdminRelease[]>>(ADMIN_BASE);
  return res?.data ?? [];
}

export async function requestUploadUrl(payload: {
  version: string;
  fileName: string;
  fileSizeBytes: number;
}): Promise<UploadUrlResponse> {
  const res = await fetcher<ApiEnvelope<UploadUrlResponse>>(
    `${ADMIN_BASE}/upload-url`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  if (!res?.data) throw new Error("Could not prepare the upload.");
  return res.data;
}

export async function createRelease(
  payload: CreateReleasePayload,
): Promise<AdminRelease> {
  const res = await fetcher<ApiEnvelope<AdminRelease>>(ADMIN_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res?.data) throw new Error("Could not save the release.");
  return res.data;
}

export async function updateRelease(
  id: string,
  payload: UpdateReleasePayload,
): Promise<AdminRelease> {
  const res = await fetcher<ApiEnvelope<AdminRelease>>(`${ADMIN_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res?.data) throw new Error("Could not update the release.");
  return res.data;
}

export async function setDownloadableRelease(
  id: string,
): Promise<AdminRelease> {
  const res = await fetcher<ApiEnvelope<AdminRelease>>(
    `${ADMIN_BASE}/${id}/set-downloadable`,
    { method: "POST" },
  );
  if (!res?.data) throw new Error("Could not change the downloadable version.");
  return res.data;
}

export async function rollbackRelease(id: string) {
  return fetcher<
    ApiEnvelope<{
      failedRelease: AdminRelease;
      activeRelease: AdminRelease | null;
    }>
  >(`${ADMIN_BASE}/${id}/rollback`, { method: "POST" });
}

/**
 * A short-lived URL for any stored version, for admins testing a build. The route needs the
 * bearer token, so it returns the presigned URL as JSON rather than redirecting.
 */
export async function fetchAdminDownloadUrl(id: string): Promise<string> {
  const res = await fetcher<ApiEnvelope<{ url: string }>>(
    `${ADMIN_BASE}/${id}/download-url`,
  );
  if (!res?.data?.url)
    throw new Error("This release has no downloadable file.");
  return res.data.url;
}

/**
 * PUTs the APK straight to S3 with the presigned URL. XMLHttpRequest rather than fetch because
 * fetch can't report upload progress, and a ~116 MB upload with no progress looks frozen.
 */
export function uploadApkToStorage(
  file: File,
  uploadUrl: string,
  contentType: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve();
      } else {
        reject(new Error(`Upload to storage failed (HTTP ${xhr.status}).`));
      }
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Upload to storage failed. Check your connection, or the bucket's CORS settings.",
        ),
      );
    xhr.send(file);
  });
}
