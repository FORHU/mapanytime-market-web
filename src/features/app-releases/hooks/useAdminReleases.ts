"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAdminDownloadUrl,
  fetchAdminReleases,
  rollbackRelease,
  setDownloadableRelease,
  updateRelease,
} from "../api/app-release.client";
import type { UpdateReleasePayload } from "../contracts/app-release.contract";
import {
  ADMIN_RELEASES_KEY,
  LATEST_RELEASE_KEY,
  RELEASE_HISTORY_KEY,
} from "./queryKeys";

/** Every uploaded version, newest build first (the API orders them). */
export function useAdminReleases() {
  return useQuery({
    queryKey: ADMIN_RELEASES_KEY,
    queryFn: fetchAdminReleases,
  });
}

/**
 * Any change to which version is downloadable also changes what the landing page serves, so the
 * public caches are invalidated alongside the admin list.
 */
function useInvalidateReleases() {
  const queryClient = useQueryClient();
  return () => {
    for (const queryKey of [
      ADMIN_RELEASES_KEY,
      LATEST_RELEASE_KEY,
      RELEASE_HISTORY_KEY,
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  };
}

// Each mutation toasts its own failure, so the global handler is told to stay quiet rather than
// showing a second toast for the same error.
const quiet = { skipGlobalErrorHandling: true };

export function useSetDownloadable() {
  const invalidate = useInvalidateReleases();
  return useMutation({
    mutationFn: (id: string) => setDownloadableRelease(id),
    meta: quiet,
    onSuccess: (release) => {
      toast.success(
        `Version ${release.version} is now the downloadable version`,
      );
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not change the downloadable version"),
  });
}

export function useUpdateRelease() {
  const invalidate = useInvalidateReleases();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReleasePayload;
    }) => updateRelease(id, payload),
    meta: quiet,
    onSuccess: (release) => {
      toast.success(`Version ${release.version} updated`);
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not update the release"),
  });
}

export function useRollbackRelease() {
  const invalidate = useInvalidateReleases();
  return useMutation({
    mutationFn: (id: string) => rollbackRelease(id),
    meta: quiet,
    onSuccess: (res) => {
      toast.success(res?.message || "Release marked as broken");
      invalidate();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not mark the release as broken"),
  });
}

/** Opens a short-lived download for any stored version, so an admin can test a build. */
export function useAdminDownload() {
  return useMutation({
    mutationFn: (id: string) => fetchAdminDownloadUrl(id),
    meta: quiet,
    onSuccess: (url) => {
      window.location.assign(url);
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not download this version"),
  });
}
