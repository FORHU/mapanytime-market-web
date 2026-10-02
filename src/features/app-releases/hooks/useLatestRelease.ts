"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchLatestRelease,
  fetchReleaseHistory,
  getApkDownloadUrl,
} from "../api/app-release.client";
import { LATEST_RELEASE_KEY, RELEASE_HISTORY_KEY } from "./queryKeys";

/**
 * The version visitors can install right now, shared by the landing page and the download dialog
 * so they can never advertise different builds.
 *
 * `downloadUrl` is the API's stable install link, not a storage URL — it carries no version or
 * path, and the API resolves it to whichever version an admin selected. It is null until a version
 * is downloadable, so callers render a disabled state instead of a link that 404s.
 */
export function useLatestRelease(enabled = true) {
  const { data, isLoading } = useQuery({
    queryKey: LATEST_RELEASE_KEY,
    queryFn: fetchLatestRelease,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const available = Boolean(data?.available && data.release);
  return {
    release: data?.release ?? null,
    available,
    loading: isLoading,
    downloadUrl: available ? getApkDownloadUrl() : null,
  };
}

/** Public version history (pulled builds excluded). Informational only — it links nothing. */
export function useReleaseHistory(enabled = true) {
  return useQuery({
    queryKey: RELEASE_HISTORY_KEY,
    queryFn: fetchReleaseHistory,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
