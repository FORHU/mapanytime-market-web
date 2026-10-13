/**
 * Shapes returned by the API's app-release endpoints (mapanytime-api/src/modules/appRelease).
 *
 * The APK itself lives in S3. Clients never see its key or a storage URL: downloads always go
 * through GET /api/v1/app/download, which redirects to a short-lived presigned URL.
 */

export type ReleaseChannel = "Stable" | "Beta";
export type ReleaseStatus = "ACTIVE" | "DEPRECATED" | "FAILED";

/** What anonymous visitors get. */
export interface PublicRelease {
  id: string;
  version: string;
  buildNumber: number;
  channel: ReleaseChannel;
  fileName: string | null;
  /** Display size, e.g. "115.9 MB". */
  fileSize: string;
  fileSizeBytes: number | null;
  minAndroidVersion: string;
  architecture: string;
  sha256: string | null;
  whatsNew: string[];
  forceUpdate: boolean;
  createdAt: string;
}

/** GET /api/v1/app/latest. `available` is false until an admin makes a version downloadable. */
export interface LatestReleaseResponse {
  available: boolean;
  release: PublicRelease | null;
}

export interface ReleaseUploader {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

/** What the admin console gets: everything, including storage details and who uploaded it. */
export interface AdminRelease extends PublicRelease {
  s3Key: string | null;
  /** Legacy releases pointed at an externally hosted file instead of S3. */
  apkUrl: string | null;
  status: ReleaseStatus;
  isDownloadable: boolean;
  hasFile: boolean;
  uploadedById: string | null;
  uploadedBy: ReleaseUploader | null;
  updatedAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  contentType: string;
  expiresIn: number;
}

export interface CreateReleasePayload {
  version: string;
  buildNumber: number;
  channel: ReleaseChannel;
  s3Key: string;
  fileName: string;
  fileSizeBytes: number;
  minAndroidVersion: string;
  architecture: string;
  sha256?: string;
  whatsNew: string[];
  forceUpdate?: boolean;
  makeDownloadable: boolean;
}

export interface UpdateReleasePayload {
  channel?: ReleaseChannel;
  minAndroidVersion?: string;
  architecture?: string;
  whatsNew?: string[];
  forceUpdate?: boolean;
  status?: Exclude<ReleaseStatus, "FAILED">;
}
