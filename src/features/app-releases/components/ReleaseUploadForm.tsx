"use client";

import { useState, type FormEvent } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { useUploadRelease, type UploadStage } from "../hooks";
import type { ReleaseChannel } from "../contracts/app-release.contract";
import { apkFileError, formatBytes, VERSION_PATTERN } from "../lib/apkFile";

interface ReleaseUploadFormProps {
  /** Pre-fills the build number with one past the highest existing build. */
  nextBuildNumber: number;
  /** When nothing is downloadable yet, the first upload defaults to becoming downloadable. */
  hasDownloadable: boolean;
}

const STAGE_LABEL: Record<Exclude<UploadStage, "idle" | "done">, string> = {
  hashing: "Checking the file…",
  preparing: "Preparing the upload…",
  uploading: "Uploading to storage…",
  saving: "Saving the release…",
};

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors text-sm";
const labelClass = "block text-xs font-semibold text-on-surface-variant mb-1.5";

export function ReleaseUploadForm({
  nextBuildNumber,
  hasDownloadable,
}: ReleaseUploadFormProps) {
  const upload = useUploadRelease();
  const busy = upload.isPending;

  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [version, setVersion] = useState("");
  const [buildNumber, setBuildNumber] = useState<number | "">("");
  const [channel, setChannel] = useState<ReleaseChannel>("Stable");
  const [minAndroidVersion, setMinAndroidVersion] = useState("Android 8.0+");
  const [architecture, setArchitecture] = useState("arm64-v8a");
  const [whatsNewInput, setWhatsNewInput] = useState("");
  const [makeDownloadable, setMakeDownloadable] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const effectiveBuild = buildNumber === "" ? nextBuildNumber : buildNumber;
  const effectiveMakeDownloadable = makeDownloadable ?? !hasDownloadable;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const whatsNew = whatsNewInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const problem =
      apkFileError(file) ??
      (!VERSION_PATTERN.test(version.trim())
        ? "Enter a version like 1.0.1."
        : null) ??
      (!Number.isInteger(effectiveBuild) || effectiveBuild < 1
        ? "Build number must be a whole number of 1 or more."
        : null) ??
      (whatsNew.length === 0
        ? "Add at least one line of release notes."
        : null);

    setError(problem);
    if (problem || !file) return;

    upload.mutate(
      {
        file,
        version: version.trim(),
        buildNumber: effectiveBuild,
        channel,
        minAndroidVersion: minAndroidVersion.trim(),
        architecture: architecture.trim(),
        whatsNew,
        makeDownloadable: effectiveMakeDownloadable,
      },
      {
        onSuccess: () => {
          setFile(null);
          setFileKey((k) => k + 1);
          setVersion("");
          setBuildNumber("");
          setWhatsNewInput("");
          setMakeDownloadable(null);
        },
      },
    );
  };

  const stageLabel =
    upload.stage !== "idle" && upload.stage !== "done"
      ? STAGE_LABEL[upload.stage]
      : null;
  const percent = Math.round(upload.progress * 100);

  return (
    <form
      onSubmit={submit}
      noValidate
      className="p-6 rounded-3xl bg-surface-container border border-outline-variant space-y-5"
      aria-labelledby="release-upload-title"
    >
      <div className="flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2
          id="release-upload-title"
          className="font-display text-lg font-bold text-on-surface"
        >
          Upload a new version
        </h2>
      </div>

      <div>
        <label htmlFor="release-file" className={labelClass}>
          APK file
        </label>
        <label
          htmlFor="release-file"
          className="flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-high hover:border-primary cursor-pointer transition-colors"
        >
          <FileUp
            className="w-5 h-5 text-primary shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm text-on-surface truncate">
            {file
              ? `${file.name} (${formatBytes(file.size)})`
              : "Choose an .apk file (up to 300 MB)"}
          </span>
        </label>
        <input
          key={fileKey}
          id="release-file"
          type="file"
          accept=".apk,application/vnd.android.package-archive"
          className="sr-only"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="release-version" className={labelClass}>
            Version
          </label>
          <input
            id="release-version"
            className={fieldClass}
            placeholder="e.g. 1.0.1"
            value={version}
            disabled={busy}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="release-build" className={labelClass}>
            Build number
          </label>
          <input
            id="release-build"
            type="number"
            min={1}
            className={fieldClass}
            value={effectiveBuild}
            disabled={busy}
            onChange={(e) =>
              setBuildNumber(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="release-channel" className={labelClass}>
            Channel
          </label>
          <select
            id="release-channel"
            className={fieldClass}
            value={channel}
            disabled={busy}
            onChange={(e) => setChannel(e.target.value as ReleaseChannel)}
          >
            <option value="Stable">Stable</option>
            <option value="Beta">Beta</option>
          </select>
        </div>
        <div>
          <label htmlFor="release-min-android" className={labelClass}>
            Min Android
          </label>
          <input
            id="release-min-android"
            className={fieldClass}
            value={minAndroidVersion}
            disabled={busy}
            onChange={(e) => setMinAndroidVersion(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="release-arch" className={labelClass}>
            Architecture
          </label>
          <input
            id="release-arch"
            className={fieldClass}
            value={architecture}
            disabled={busy}
            onChange={(e) => setArchitecture(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="release-notes" className={labelClass}>
          What&apos;s new (one item per line)
        </label>
        <textarea
          id="release-notes"
          rows={4}
          className={fieldClass}
          placeholder={"Faster map loading\nFixes for pickup notifications"}
          value={whatsNewInput}
          disabled={busy}
          onChange={(e) => setWhatsNewInput(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-on-surface cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--md-sys-color-primary)]"
          checked={effectiveMakeDownloadable}
          disabled={busy}
          onChange={(e) => setMakeDownloadable(e.target.checked)}
        />
        <span>
          Make this the downloadable version now
          <span className="block text-xs text-on-surface-variant">
            Visitors who tap Install on the landing page get this version.
          </span>
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      )}

      {stageLabel && (
        <div className="space-y-2" aria-live="polite">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>{stageLabel}</span>
            {upload.stage === "uploading" && <span>{percent}%</span>}
          </div>
          <div
            className="h-2 rounded-full bg-surface-container-highest overflow-hidden"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={upload.stage === "uploading" ? percent : undefined}
          >
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{
                width:
                  upload.stage === "uploading"
                    ? `${percent}%`
                    : upload.stage === "saving"
                      ? "100%"
                      : "8%",
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3.5 px-6 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        <UploadCloud className="w-4 h-4" aria-hidden="true" />
        {busy ? "Uploading…" : "Upload version"}
      </button>
    </form>
  );
}
