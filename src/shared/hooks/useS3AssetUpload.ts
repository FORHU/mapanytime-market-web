import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetcher } from "@/shared/lib/http";
import {
  PresignedUrlResponse,
  UploadFolder,
  UploadSuccessResult,
} from "@/shared/types/upload";

/**
 * Two-step direct-to-S3 upload:
 *   1. ask the API for a presigned PUT URL (authenticated, 15-minute expiry)
 *   2. PUT the file straight to S3, bypassing our servers
 *
 * The presign step goes through `fetcher` so it carries the bearer token and
 * participates in refresh-token rotation. The PUT deliberately does not — it
 * targets S3's origin, and the signature is the authorization.
 */
const executeCloudUpload = async (
  file: File,
  folder: UploadFolder,
): Promise<UploadSuccessResult> => {
  const query = new URLSearchParams({
    fileName: file.name,
    mimeType: file.type,
    folder,
  });

  const { data } = await fetcher<{ data: PresignedUrlResponse }>(
    `/api/v1/file-uploads/presigned-url?${query.toString()}`,
  );

  const transferRes = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!transferRes.ok)
    throw new Error("S3 failed to register content data package.");

  return { fileKey: data.fileKey, fileName: file.name };
};

/**
 * @param folder Where the asset belongs. Compliance documents must not land in
 * the same prefix as public catalog imagery.
 */
export function useS3AssetUpload(
  folder: UploadFolder,
): UseMutationResult<UploadSuccessResult, Error, File> {
  return useMutation<UploadSuccessResult, Error, File>({
    mutationFn: (file) => executeCloudUpload(file, folder),
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.fileName}!`);
    },
    onError: (error) => {
      toast.error(error.message || "Cloud pipeline process collapsed.");
    },
  });
}
