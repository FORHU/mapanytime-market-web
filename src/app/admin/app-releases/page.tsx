"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowLeft,
  Plus,
  RefreshCw,
  PackageX,
} from "lucide-react";
import Link from "next/link";
import {
  fetchAdminReleaseHistory,
  createRelease,
  rollbackRelease,
  setLatestRelease,
  type AdminAppRelease,
} from "@/features/app-releases/api/app-release.client";
import { ApiError } from "@/shared/errors/api-error";

type AppReleaseItem = AdminAppRelease;

/**
 * Surfaces the API's own message rather than a blanket "Network error" — the server explains
 * why a publish was rejected (bad version, malformed sha256, release already rolled back) and
 * that explanation is the whole value of the response.
 */
function errorText(err: unknown, action: string) {
  if (err instanceof ApiError) return err.message;
  return `Network error — could not ${action}.`;
}

/** Shared input styling, so the eight fields below don't each restate it. */
const inputClass =
  "w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface focus:border-primary focus:outline-none";

export default function AdminAppReleasesPage() {
  const [releases, setReleases] = useState<AppReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state for publishing new release
  const [version, setVersion] = useState("1.0.1");
  const [buildNumber, setBuildNumber] = useState(2);
  const [channel, setChannel] = useState("Stable");
  const [apkUrl, setApkUrl] = useState("");
  const [fileSize, setFileSize] = useState("115.9 MB");
  const [minAndroidVersion, setMinAndroidVersion] = useState("Android 8.0+");
  const [architecture, setArchitecture] = useState("arm64-v8a");
  const [sha256, setSha256] = useState("");
  const [whatsNewInput, setWhatsNewInput] = useState(
    "Bug fixes & performance improvements\nUpdated store location accuracy",
  );

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const history = await fetchAdminReleaseHistory();
      setReleases(history);

      // Advance the form past whatever is already published. Hardcoded "1.0.1"/build 2 defaults
      // go stale the moment the first release ships, and buildNumber collisions are rejected
      // (AppRelease.buildNumber is @unique).
      const highestBuild = history.reduce(
        (max, r) => Math.max(max, r.buildNumber ?? 0),
        0,
      );
      if (highestBuild > 0) {
        setBuildNumber(highestBuild + 1);
      }
    } catch (err) {
      console.error("Failed to fetch releases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setMsg(null);

      const whatsNewArray = whatsNewInput
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      await createRelease({
        version,
        buildNumber: Number(buildNumber),
        channel,
        apkUrl,
        fileSize,
        minAndroidVersion,
        architecture,
        sha256: sha256 || undefined,
        whatsNew: whatsNewArray,
        isLatest: true,
      });

      setMsg({
        type: "success",
        text: `Release v${version} published successfully!`,
      });
      fetchReleases();
    } catch (err) {
      setMsg({ type: "error", text: errorText(err, "publish release") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async (releaseId: string, ver: string) => {
    if (
      !confirm(
        `Are you sure you want to rollback release v${ver}? This will mark it as FAILED and promote the previous working version!`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setMsg(null);

      await rollbackRelease(releaseId);

      setMsg({
        type: "success",
        text: `Rolled back v${ver}! Active version automatically demoted to previous stable build.`,
      });
      fetchReleases();
    } catch (err) {
      setMsg({ type: "error", text: errorText(err, "execute rollback") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetLatest = async (releaseId: string, ver: string) => {
    try {
      setActionLoading(true);
      setMsg(null);

      await setLatestRelease(releaseId);

      setMsg({
        type: "success",
        text: `v${ver} set as live active release!`,
      });
      fetchReleases();
    } catch (err) {
      setMsg({ type: "error", text: errorText(err, "update release status") });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * No fallback to `releases[0]`. The admin history is fetched with `includeFailed=true`, so the
   * first row can be a FAILED build — after rolling back the only release, the old fallback
   * presented that build under a "Live Active Version" badge while simultaneously hiding the
   * rollback button because the status wasn't ACTIVE. If nothing is live, say so.
   */
  const activeRelease = releases.find(
    (r) => r.isLatest && r.status === "ACTIVE",
  );

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container border border-outline-variant">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-headline-md text-on-surface">
                  Mobile Release Management
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Publish APK releases, configure forced updates, and execute
                  1-click rollbacks.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchReleases}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-sm font-medium transition-colors flex items-center space-x-2 text-on-surface-variant disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Releases</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {msg && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-sm ${
              msg.type === "success"
                ? "bg-primary-container border-primary/30 text-on-primary-container"
                : "bg-error-container border-error/30 text-on-error-container"
            }`}
          >
            <div className="flex items-center space-x-2">
              {msg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{msg.text}</span>
            </div>
            <button
              onClick={() => setMsg(null)}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Active Release Banner */}
        {!loading && activeRelease && (
          <div className="p-6 rounded-3xl bg-primary-container text-on-primary-container border border-primary/30 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-on-primary uppercase tracking-wider">
                    Live Active Version
                  </span>
                  <span className="text-xs opacity-80">
                    Channel: {activeRelease.channel}
                  </span>
                </div>
                <h2 className="font-display text-headline-md">
                  v{activeRelease.version}{" "}
                  <span className="text-lg font-normal opacity-80">
                    (Build {activeRelease.buildNumber})
                  </span>
                </h2>
                <p className="text-xs opacity-80">
                  APK URL:{" "}
                  <code className="font-mono">{activeRelease.apkUrl}</code> •
                  Size: {activeRelease.fileSize}
                </p>
              </div>

              <button
                onClick={() =>
                  handleRollback(activeRelease.id, activeRelease.version)
                }
                disabled={actionLoading}
                className="px-5 py-3 rounded-2xl bg-error-container text-on-error-container border border-error/40 hover:opacity-90 text-sm font-bold transition-all flex items-center space-x-2 self-start md:self-auto disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Execute 1-Click Rollback</span>
              </button>
            </div>
          </div>
        )}

        {/* Explicit no-active-release state — see the comment on `activeRelease` above. */}
        {!loading && !activeRelease && (
          <div className="p-6 rounded-3xl bg-surface-container border border-outline-variant flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-surface-container-high text-on-surface-variant">
              <PackageX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-headline-md text-on-surface">
                No active release
              </h2>
              <p className="text-sm text-on-surface-variant">
                {releases.length === 0
                  ? "Nothing has been published yet. Use the form below to publish the first build."
                  : "Every published build is rolled back or deprecated. Clients are falling back to the bundled default — publish a new release, or set an existing build active from the history."}
              </p>
            </div>
          </div>
        )}

        {/* Grid: Form & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-container border border-outline-variant space-y-5">
            <div className="flex items-center space-x-2 text-on-surface font-bold text-lg">
              <Plus className="w-5 h-5 text-primary" />
              <span>Publish New APK Release</span>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">
                    Version String
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={`${inputClass} font-mono`}
                    placeholder="e.g. 1.0.1"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1">
                    Build Number
                  </label>
                  <input
                    type="number"
                    required
                    value={buildNumber}
                    onChange={(e) => setBuildNumber(Number(e.target.value))}
                    className={`${inputClass} font-mono`}
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">
                  APK File URL
                </label>
                <input
                  type="url"
                  required
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  className={`${inputClass} font-mono`}
                  placeholder="https://storage.example.com/mapanytime-v1.0.1.apk"
                />
                {/* The web app does not host APKs — /public/downloads/ is gitignored. An absolute
                    URL to wherever the artefact actually lives is what clients need. */}
                <p className="mt-1 text-on-surface-variant opacity-80">
                  Absolute URL to the hosted artefact (object storage, GitHub
                  Releases, …).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1">
                    Min Android Version
                  </label>
                  <input
                    type="text"
                    value={minAndroidVersion}
                    onChange={(e) => setMinAndroidVersion(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Stable">Stable</option>
                    <option value="Beta">Beta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant mb-1">
                    Architecture
                  </label>
                  <input
                    type="text"
                    value={architecture}
                    onChange={(e) => setArchitecture(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">
                  SHA-256 Checksum (Optional)
                </label>
                <input
                  type="text"
                  value={sha256}
                  onChange={(e) => setSha256(e.target.value)}
                  className={`${inputClass} font-mono`}
                  placeholder="Optional SHA-256 hash"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">
                  What&apos;s New (1 item per line)
                </label>
                <textarea
                  rows={4}
                  value={whatsNewInput}
                  onChange={(e) => setWhatsNewInput(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm transition-all shadow-lg disabled:opacity-50"
              >
                {actionLoading
                  ? "Processing..."
                  : "Publish & Set Active Latest"}
              </button>
            </form>
          </div>

          {/* History List Column */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-container border border-outline-variant space-y-5">
            <div className="flex items-center justify-between text-on-surface font-bold text-lg">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-secondary" />
                <span>Release History ({releases.length})</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">
                Loading release history...
              </div>
            ) : releases.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant text-sm">
                No releases published yet. Use the form to publish v1.0.0!
              </div>
            ) : (
              <div className="space-y-3">
                {releases.map((rel) => (
                  <div
                    key={rel.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      rel.isLatest && rel.status === "ACTIVE"
                        ? "bg-primary-container/40 border-primary/40"
                        : rel.status === "FAILED"
                          ? "bg-error-container/40 border-error/30"
                          : "bg-surface-container-low border-outline-variant"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-on-surface text-base">
                            v{rel.version}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            (Build {rel.buildNumber})
                          </span>
                          {rel.isLatest && rel.status === "ACTIVE" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-on-primary rounded-full">
                              LATEST
                            </span>
                          )}
                          {rel.status === "FAILED" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-error-container text-on-error-container border border-error/30 rounded-full">
                              FAILED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {rel.fileSize} • {rel.minAndroidVersion} •{" "}
                          {new Date(rel.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {rel.status === "ACTIVE" && !rel.isLatest && (
                          <button
                            onClick={() => handleSetLatest(rel.id, rel.version)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Set Active
                          </button>
                        )}

                        {rel.status === "ACTIVE" && (
                          <button
                            onClick={() => handleRollback(rel.id, rel.version)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/30 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
