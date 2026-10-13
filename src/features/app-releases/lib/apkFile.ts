/** Mirrors the API's MAX_APK_BYTES (mapanytime-api/src/modules/appRelease/app-release.constants.ts). */
export const MAX_APK_BYTES = 300 * 1024 * 1024;

/** Same rule the API's Joi schema applies, so the form can say no before an upload starts. */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/;

/** Why a picked file can't be uploaded, or null if it can. */
export function apkFileError(file: File | null): string | null {
  if (!file) return "Choose an APK file to upload.";
  if (!/\.apk$/i.test(file.name)) return "Only .apk files can be uploaded.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_APK_BYTES)
    return "The APK is larger than the 300 MB limit.";
  return null;
}

/** "115.9 MB" — the same format the API stores in `fileSize`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * SHA-256 of the file, hex encoded, computed in the browser so the checksum users are shown comes
 * from the actual bytes rather than being typed in. Returns undefined where Web Crypto isn't
 * available (it needs a secure context: https or localhost); the checksum is optional.
 */
export async function sha256Hex(file: File): Promise<string | undefined> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return undefined;
  const digest = await subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
