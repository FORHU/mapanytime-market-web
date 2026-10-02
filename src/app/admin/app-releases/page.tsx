"use client";

import { CheckCircle2, PackageX, RefreshCw, Smartphone } from "lucide-react";
import { useAdminReleases } from "@/features/app-releases/hooks";
import { ReleaseUploadForm } from "@/features/app-releases/components/ReleaseUploadForm";
import { ReleaseList } from "@/features/app-releases/components/ReleaseList";
import { Button } from "@/shared/components/ui/Button";

export default function AppReleasesAdminPage() {
  const {
    data: releases = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminReleases();

  const downloadable = releases.find((r) => r.isDownloadable);
  const nextBuildNumber =
    releases.reduce((max, r) => Math.max(max, r.buildNumber), 0) + 1;

  return (
    <div className="space-y-6 p-6 text-on-surface">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-container text-on-primary-container">
            <Smartphone className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-on-surface">App releases</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Upload Android APKs and choose which version visitors download
              from the landing page.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm font-medium text-on-surface-variant flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {!isLoading && !isError && (
        <div
          className={`p-5 rounded-3xl border flex items-start gap-4 ${
            downloadable
              ? "bg-primary-container text-on-primary-container border-primary/30"
              : "bg-surface-container border-outline-variant"
          }`}
        >
          {downloadable ? (
            <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden="true" />
          ) : (
            <PackageX
              className="w-6 h-6 shrink-0 text-on-surface-variant"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              Currently downloadable
            </p>
            {downloadable ? (
              <p className="font-display text-xl font-bold mt-1">
                v{downloadable.version}{" "}
                <span className="text-sm font-normal opacity-80">
                  Build {downloadable.buildNumber} · {downloadable.fileSize}
                </span>
              </p>
            ) : (
              <p className="text-sm mt-1 text-on-surface-variant">
                No version is downloadable, so the landing page&apos;s Install
                button says the app is coming soon. Upload a version, or make
                one in the list downloadable.
              </p>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="py-12 text-center text-on-surface-variant">
          Loading versions…
        </p>
      ) : isError ? (
        <div className="rounded-xl border border-error bg-error-container p-6 text-center text-on-error-container">
          <p className="font-medium">Could not load app releases.</p>
          <p className="mt-1 text-sm">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ReleaseUploadForm
              nextBuildNumber={nextBuildNumber}
              hasDownloadable={Boolean(downloadable)}
            />
          </div>
          <section
            className="lg:col-span-7 space-y-3"
            aria-labelledby="versions-title"
          >
            <h2
              id="versions-title"
              className="font-display text-lg font-bold text-on-surface"
            >
              All versions{" "}
              <span className="text-sm font-normal text-on-surface-variant">
                ({releases.length}, newest first)
              </span>
            </h2>
            <ReleaseList releases={releases} />
          </section>
        </div>
      )}
    </div>
  );
}
