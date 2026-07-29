/**
 * Destination folder on the API's presign endpoint. Mirrors the Joi enum in
 * mapanytime-api `fileUpload.controller.ts` — keep the two in sync.
 *
 * `compliance` holds seller verification documents (permits, certificates),
 * `products` holds catalog imagery, `avatars` holds profile pictures.
 */
export type UploadFolder = "compliance" | "products" | "avatars";

/** `data` payload of GET /api/v1/file-uploads/presigned-url. */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadSuccessResult {
  fileKey: string;
  fileName: string;
}
