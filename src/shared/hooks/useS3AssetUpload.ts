import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PresignedUrlResponse,
  UploadSuccessResult,
} from "@/shared/types/upload";

const executeCloudUpload = async (file: File): Promise<UploadSuccessResult> => {
  const ticketRes = await fetch(
    `/api/s3-upload?filename=${encodeURIComponent(file.name)}&contentType=${file.type}`,
  );
  if (!ticketRes.ok)
    throw new Error("Cloud gateway declined to authorize transaction.");

  const { url, fileKey }: PresignedUrlResponse = await ticketRes.json();

  const transferRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!transferRes.ok)
    throw new Error("S3 failed to register content data package.");

  return { fileKey, fileName: file.name };
};

export function useS3AssetUpload(): UseMutationResult<
  UploadSuccessResult,
  Error,
  File
> {
  return useMutation<UploadSuccessResult, Error, File>({
    mutationFn: executeCloudUpload,
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.fileName} to store layout!`);
    },
    onError: (error) => {
      toast.error(error.message || "Cloud pipeline process collapsed.");
    },
  });
}
