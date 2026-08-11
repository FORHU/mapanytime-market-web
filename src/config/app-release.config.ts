export interface AppReleaseInfo {
  id?: string;
  version: string;
  buildNumber: number;
  channel: "Stable" | "Beta";
  /** Display date, derived from the API's `createdAt`. Absent until a release is fetched. */
  releaseDate?: string;
  /** ISO timestamp as returned by the API. */
  createdAt?: string;
  apkUrl: string;
  fileSize: string;
  minAndroidVersion: string;
  architecture: string;
  sha256?: string;
  whatsNew: string[];
  status?: "ACTIVE" | "DEPRECATED" | "FAILED";
  isLatest?: boolean;
  forceUpdate?: boolean;
  history?: AppReleaseInfo[];
}

export const DEFAULT_APP_RELEASE: AppReleaseInfo = {
  version: "1.0.0",
  buildNumber: 1,
  channel: "Stable",
  releaseDate: "August 6, 2026",
  // Deliberately empty. This used to point at /downloads/latest.apk, but /public/downloads/ and
  // *.apk are gitignored, so on any fresh deploy with no published release the download button
  // and both QR codes led to a guaranteed 404. An empty apkUrl means "no build available" —
  // resolveApkUrl() maps it to null and the UI disables the download affordances. The real URL
  // comes from AppRelease.apkUrl, published through the admin console.
  apkUrl: "",
  fileSize: "115.9 MB",
  minAndroidVersion: "Android 8.0+",
  architecture: "arm64-v8a",
  // No checksum here on purpose. A hardcoded hash goes stale the moment a new APK is built, and
  // showing a wrong one tells users their good download was tampered with. The only trustworthy
  // source is AppRelease.sha256, computed at publish time — if the API has none, show none.
  // No "✓ " prefixes — the modal already renders a CheckCircle2 icon per bullet, so baking the
  // glyph into the copy showed a double tick. Live release notes from the API carry no prefix
  // either, so this now matches them.
  whatsNew: [
    "Store Discovery & Realtime Interactive Map",
    "Realtime In-App Messaging & Notifications",
    "Multi-Store Cart & Live Order Status Tracking",
    "Performance Optimizations & UI Polish",
  ],
  history: [
    {
      version: "1.0.0",
      buildNumber: 1,
      channel: "Stable",
      releaseDate: "August 6, 2026",
      // Same reasoning as above — no bundled path to a binary that isn't in the repo.
      apkUrl: "",
      fileSize: "115.9 MB",
      minAndroidVersion: "Android 8.0+",
      architecture: "arm64-v8a",
      whatsNew: ["Initial Stable Public Release"],
    },
  ],
};
