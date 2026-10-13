"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useUpdateRelease } from "../hooks";
import type {
  AdminRelease,
  ReleaseChannel,
} from "../contracts/app-release.contract";

interface EditReleaseDialogProps {
  release: AdminRelease;
  onClose: () => void;
}

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm";
const labelClass = "block text-xs font-semibold text-on-surface-variant mb-1.5";

/** Edits a release's descriptive fields. The version and the APK file are immutable. */
export function EditReleaseDialog({
  release,
  onClose,
}: EditReleaseDialogProps) {
  const update = useUpdateRelease();
  const [channel, setChannel] = useState<ReleaseChannel>(release.channel);
  const [minAndroidVersion, setMinAndroidVersion] = useState(
    release.minAndroidVersion,
  );
  const [architecture, setArchitecture] = useState(release.architecture);
  const [whatsNewInput, setWhatsNewInput] = useState(
    release.whatsNew.join("\n"),
  );
  const [forceUpdate, setForceUpdate] = useState(release.forceUpdate);
  const [status, setStatus] = useState<"ACTIVE" | "DEPRECATED">(
    release.status === "DEPRECATED" ? "DEPRECATED" : "ACTIVE",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !update.isPending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, update.isPending]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const whatsNew = whatsNewInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (whatsNew.length === 0) {
      setError("Add at least one line of release notes.");
      return;
    }
    update.mutate(
      {
        id: release.id,
        payload: {
          channel,
          minAndroidVersion: minAndroidVersion.trim(),
          architecture: architecture.trim(),
          whatsNew,
          forceUpdate,
          status,
        },
      },
      { onSuccess: onClose },
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !update.isPending) onClose();
      }}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-release-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-outline-variant bg-surface-container text-on-surface p-6 md:p-8 shadow-2xl space-y-5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-full bg-surface-container-highest text-on-surface-variant"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 id="edit-release-title" className="font-display text-lg font-bold">
          Edit v{release.version}{" "}
          <span className="text-on-surface-variant font-normal">
            (Build {release.buildNumber})
          </span>
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="edit-channel" className={labelClass}>
              Channel
            </label>
            <select
              id="edit-channel"
              className={fieldClass}
              value={channel}
              onChange={(e) => setChannel(e.target.value as ReleaseChannel)}
            >
              <option value="Stable">Stable</option>
              <option value="Beta">Beta</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-min-android" className={labelClass}>
              Min Android
            </label>
            <input
              id="edit-min-android"
              className={fieldClass}
              value={minAndroidVersion}
              onChange={(e) => setMinAndroidVersion(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-arch" className={labelClass}>
              Architecture
            </label>
            <input
              id="edit-arch"
              className={fieldClass}
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-notes" className={labelClass}>
            What&apos;s new (one item per line)
          </label>
          <textarea
            id="edit-notes"
            rows={4}
            className={fieldClass}
            value={whatsNewInput}
            onChange={(e) => setWhatsNewInput(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="edit-status" className={labelClass}>
            Status
          </label>
          <select
            id="edit-status"
            className={fieldClass}
            value={status}
            disabled={release.isDownloadable}
            onChange={(e) =>
              setStatus(e.target.value as "ACTIVE" | "DEPRECATED")
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="DEPRECATED">Deprecated</option>
          </select>
          {release.isDownloadable && (
            <p className="mt-1.5 text-xs text-on-surface-variant">
              This is the downloadable version. Make another version
              downloadable before deprecating it.
            </p>
          )}
        </div>

        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--md-sys-color-primary)]"
            checked={forceUpdate}
            onChange={(e) => setForceUpdate(e.target.checked)}
          />
          Mark as a required update
        </label>

        {error && (
          <p role="alert" className="text-sm font-medium text-error">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-container-highest text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={update.isPending}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold disabled:opacity-50"
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
