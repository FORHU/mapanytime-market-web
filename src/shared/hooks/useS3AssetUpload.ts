import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PresignedUrlResponse,
  UploadFolder,
  UploadSuccessResult,
} from "@/shared/types/upload";
import { fetcher } from "@/shared/lib/http";

/**
 * Two-step direct-to-S3 upload:
 *   1. ask the API for a presigned PUT URL (15-min expiry)
 *   2. PUT the file straight to S3, bypassing our servers
 *
 * The presign step calls the API's `GET /v1/file-uploads/presigned-url`, which
 * signs with the credentials the API already holds. This used to go through a
 * Next route handler in this app, which meant the web needed its own copy of
 * AWS_ACCESS_KEY_ID / SECRET / BUCKET — they were blank, so every upload 500d
 * before it started. Routing through the API keeps this app credential-free,
 * which is what its .env has always claimed. See FLAGS.md.
 *
 * Both sides derive the same key shape ({folder}/{16-byte hex}.{ext}) and the
 * same 15-minute expiry, so the response contract is unchanged: { uploadUrl,
 * fileKey } inside the API's standard `data` envelope.
 *
 * Unlike the S3 PUT — where the signature is the authorization — the presign
 * call is authenticated, so it goes through `fetcher` to pick up the bearer
 * token.
 *
 * After the S3 upload succeeds, persists a Files record via POST /api/v1/files
 * so the backend can reference the file. Returns the saved file ID.
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

  if (!data?.uploadUrl || !data?.fileKey) {
    throw new Error("Couldn't prepare the upload. Try again.");
  }

  const transferRes = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!transferRes.ok) {
    throw new Error("Upload to storage failed. Try again.");
  }

  const fileRecord: any = await fetcher("/api/v1/files", {
    method: "POST",
    body: JSON.stringify({
      fileKey: data.fileKey,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });

  return {
    fileKey: data.fileKey,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    fileId: fileRecord?.data?.id,
  } as UploadSuccessResult & { fileId?: string };
};

/**
 * @param folder Where the asset belongs. Compliance documents must not land in
 * the same prefix as public catalog imagery.
 */
export function useS3AssetUpload(
  folder: UploadFolder,
): UseMutationResult<UploadSuccessResult & { fileId?: string }, Error, File> {
  return useMutation<UploadSuccessResult & { fileId?: string }, Error, File>({
    mutationFn: (file) => executeCloudUpload(file, folder),
    onSuccess: (data) => {
      toast.success(`Uploaded ${data.fileName}`);
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed. Try again.");
    },
  });
}
