"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  History,
  Pencil,
  RotateCcw,
  Star,
} from "lucide-react";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import {
  useAdminDownload,
  useRollbackRelease,
  useSetDownloadable,
} from "../hooks";
import type { AdminRelease } from "../contracts/app-release.contract";
import { EditReleaseDialog } from "./EditReleaseDialog";

interface ReleaseListProps {
  releases: AdminRelease[];
}

type Pending =
  | { kind: "downloadable"; release: AdminRelease }
  | { kind: "rollback"; release: AdminRelease }
  | null;

function uploaderName(release: AdminRelease) {
  const u = release.uploadedBy;
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

const actionClass =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

/** Every uploaded version, newest first, with the downloadable one clearly marked. */
export function ReleaseList({ releases }: ReleaseListProps) {
  const [pending, setPending] = useState<Pending>(null);
  const [editing, setEditing] = useState<AdminRelease | null>(null);
  const setDownloadable = useSetDownloadable();
  const rollback = useRollbackRelease();
  const download = useAdminDownload();

  const confirm = () => {
    if (!pending) return;
    const mutation =
      pending.kind === "downloadable" ? setDownloadable : rollback;
    mutation.mutate(pending.release.id, { onSettled: () => setPending(null) });
  };

  if (releases.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-surface-container border border-outline-variant text-center">
        <History
          className="w-8 h-8 mx-auto text-on-surface-variant mb-3"
          aria-hidden="true"
        />
        <p className="font-semibold text-on-surface">
          No versions uploaded yet
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          Upload the first APK with the form to make the app installable.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3" aria-label="Uploaded versions">
        {releases.map((release) => {
          const failed = release.status === "FAILED";
          const canSelect =
            !release.isDownloadable && !failed && release.hasFile;
          const by = uploaderName(release);

          return (
            <li
              key={release.id}
              className={`p-4 rounded-2xl border transition-colors ${
                release.isDownloadable
                  ? "bg-primary-container/50 border-primary"
                  : "bg-surface-container border-outline-variant"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-bold text-on-surface">
                      v{release.version}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      Build {release.buildNumber}
                    </span>
                    {release.isDownloadable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        Downloadable
                      </span>
                    )}
                    {release.status === "DEPRECATED" && (
                      <StatusPill label="Deprecated" variant="warning" />
                    )}
                    {failed && <StatusPill label="Broken" variant="error" />}
                    {release.channel === "Beta" && (
                      <StatusPill label="Beta" variant="info" />
                    )}
                    {!release.hasFile && (
                      <StatusPill label="No file" variant="error" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    {[
                      release.fileName,
                      release.fileSize,
                      `Uploaded ${formatDate(release.createdAt)}`,
                      by && `by ${by}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {canSelect && (
                    <button
                      type="button"
                      className={`${actionClass} bg-primary text-on-primary hover:opacity-90`}
                      onClick={() =>
                        setPending({ kind: "downloadable", release })
                      }
                    >
                      <Star className="w-3.5 h-3.5" aria-hidden="true" />
                      Make downloadable
                    </button>
                  )}
                  {release.hasFile && (
                    <button
                      type="button"
                      className={`${actionClass} bg-surface-container-highest text-on-surface hover:bg-surface-container-high`}
                      onClick={() => download.mutate(release.id)}
                      disabled={download.isPending}
                      aria-label={`Download v${release.version}`}
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      Download
                    </button>
                  )}
                  {!failed && (
                    <>
                      <button
                        type="button"
                        className={`${actionClass} bg-surface-container-highest text-on-surface hover:bg-surface-container-high`}
                        onClick={() => setEditing(release)}
                        aria-label={`Edit v${release.version}`}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${actionClass} bg-error-container text-on-error-container hover:opacity-90`}
                        onClick={() =>
                          setPending({ kind: "rollback", release })
                        }
                        aria-label={`Mark v${release.version} as broken`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        Mark as broken
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={pending?.kind === "downloadable"}
        title={`Make v${pending?.release.version} downloadable?`}
        description="Visitors who tap Install on the landing page will get this version. The current downloadable version stops being offered."
        confirmLabel="Make downloadable"
        isLoading={setDownloadable.isPending}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "rollback"}
        title={`Mark v${pending?.release.version} as broken?`}
        description={
          pending?.release.isDownloadable
            ? "It stops being offered, and the newest remaining working version becomes downloadable. This can't be undone; upload a new version to replace it."
            : "It can never be made downloadable again. This can't be undone."
        }
        confirmLabel="Mark as broken"
        variant="danger"
        isLoading={rollback.isPending}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
      {editing && (
        <EditReleaseDialog release={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
