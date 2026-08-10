"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_APP_RELEASE,
  type AppReleaseInfo,
} from "@/config/app-release.config";
import { fetchLatestRelease } from "../api/app-release.client";

/**
 * Resolve a published `apkUrl` to something a phone can actually open.
 *
 * Returns null when no artefact is available, which is the honest state until someone publishes
 * a release: the bundled defaults deliberately carry no apkUrl, because `/public/downloads/` is
 * gitignored and linking there guaranteed a 404. Callers must render a disabled state on null
 * rather than emitting a dead link or a QR that scans to nothing.
 *
 * Absolute URLs (object storage, GitHub Releases) pass through unchanged; a relative path is
 * resolved against the current origin for the case where the web app does host the binary.
 */
export function resolveApkUrl(apkUrl: string | undefined): string | null {
  if (!apkUrl) return null;
  if (typeof window === "undefined") return null;
  try {
    return new URL(apkUrl, window.location.origin).toString();
  } catch {
    return null;
  }
}

/**
 * Latest release metadata, shared by the landing-page hero QR and the download modal so the two
 * can never advertise different builds. The hero used to encode DEFAULT_APP_RELEASE.apkUrl while
 * the modal fetched the live release, so publishing a release made the two QR codes on the same
 * page point at different URLs.
 *
 * Falls back to the bundled defaults when the API is unreachable — metadata still renders, but
 * `downloadUrl` stays null so nothing links to a build that isn't there.
 */
export function useLatestRelease(enabled = true) {
  const [release, setRelease] = useState<AppReleaseInfo>(DEFAULT_APP_RELEASE);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const latest = await fetchLatestRelease();
      if (cancelled) return;

      if (latest) {
        setRelease({
          ...DEFAULT_APP_RELEASE,
          ...latest,
          // Never fall back for the checksum — a stale hash tells users a good download
          // was tampered with. Show one only when the API supplies it.
          sha256: latest.sha256 || undefined,
          whatsNew: Array.isArray(latest.whatsNew)
            ? latest.whatsNew
            : DEFAULT_APP_RELEASE.whatsNew,
        });
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { release, loading, downloadUrl: resolveApkUrl(release.apkUrl) };
}
