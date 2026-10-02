"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRelease,
  requestUploadUrl,
  uploadApkToStorage,
} from "../api/app-release.client";
import type {
  AdminRelease,
  ReleaseChannel,
} from "../contracts/app-release.contract";
import { sha256Hex } from "../lib/apkFile";
import {
  ADMIN_RELEASES_KEY,
  LATEST_RELEASE_KEY,
  RELEASE_HISTORY_KEY,
} from "./queryKeys";

export type UploadStage =
  "idle" | "hashing" | "preparing" | "uploading" | "saving" | "done";

export interface UploadReleaseInput {
  file: File;
  version: string;
  buildNumber: number;
  channel: ReleaseChannel;
  minAndroidVersion: string;
  architecture: string;
  whatsNew: string[];
  makeDownloadable: boolean;
}

/**
 * Uploads an APK and records it as a release:
 *   1. hash the file in the browser (the checksum users see),
 *   2. ask the API for a presigned S3 upload URL (it also refuses duplicate versions here),
 *   3. PUT the file straight to S3, reporting progress,
 *   4. save the release; the API checks the object landed at the expected size first.
 *
 * `stage` and `progress` (0–1, during "uploading") drive the form's progress UI.
 */
export function useUploadRelease() {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<AdminRelease, Error, UploadReleaseInput>({
    mutationFn: async (input) => {
      setProgress(0);

      setStage("hashing");
      const sha256 = await sha256Hex(input.file);

      setStage("preparing");
      const { uploadUrl, s3Key, contentType } = await requestUploadUrl({
        version: input.version,
        fileName: input.file.name,
        fileSizeBytes: input.file.size,
      });

      setStage("uploading");
      await uploadApkToStorage(input.file, uploadUrl, contentType, setProgress);

      setStage("saving");
      return createRelease({
        version: input.version,
        buildNumber: input.buildNumber,
        channel: input.channel,
        s3Key,
        fileName: input.file.name,
        fileSizeBytes: input.file.size,
        minAndroidVersion: input.minAndroidVersion,
        architecture: input.architecture,
        sha256,
        whatsNew: input.whatsNew,
        makeDownloadable: input.makeDownloadable,
      });
    },
    meta: { skipGlobalErrorHandling: true },
    onSuccess: (release) => {
      setStage("done");
      toast.success(
        release.isDownloadable
          ? `Version ${release.version} uploaded and is now downloadable`
          : `Version ${release.version} uploaded`,
      );
      for (const queryKey of [
        ADMIN_RELEASES_KEY,
        LATEST_RELEASE_KEY,
        RELEASE_HISTORY_KEY,
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (error) => {
      setStage("idle");
      toast.error(error.message || "Upload failed");
    },
  });

  const reset = () => {
    mutation.reset();
    setStage("idle");
    setProgress(0);
  };

  return { ...mutation, stage, progress, reset };
}
