export interface PresignedUrlResponse {
  url: string;
  fileKey: string;
}

export interface UploadSuccessResult {
  fileKey: string;
  fileName: string;
}
