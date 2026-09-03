/**
 * Destination folder on the presign route. Mirrors the Joi enum in
 * mapanytime-api `fileUpload.controller.ts`, which is now the only presigner —
 * keep the two in sync.
 *
 * `compliance` holds seller verification documents (permits, certificates),
 * `products` holds catalog imagery, `avatars` holds profile pictures, `stores`
 * holds the store photo shown on the store's map marker (Stores.bannerId).
 */
export type UploadFolder = "compliance" | "products" | "avatars" | "stores";

/** `data` payload of GET /api/v1/file-uploads/presigned-url. */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadSuccessResult {
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
}
