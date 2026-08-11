"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Smartphone,
  CheckCircle2,
  QrCode as QrIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
  HardDrive,
  Calendar,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import {
  DEFAULT_APP_RELEASE,
  AppReleaseInfo,
} from "@/config/app-release.config";
import { QRCodeSVG } from "qrcode.react";
import { fetchReleaseHistory } from "@/features/app-releases/api/app-release.client";
import {
  useLatestRelease,
  resolveApkUrl,
} from "@/features/app-releases/hooks/useLatestRelease";

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ApkDownloadModal({
  isOpen,
  onClose,
}: ApkDownloadModalProps) {
  // Shared with the landing-page hero QR, so both always advertise the same build.
  const { release } = useLatestRelease(isOpen);

  const [copiedSha, setCopiedSha] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  // Whatever had focus before the modal opened, so it can be handed back on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const { data: historyData } = useQuery({
    queryKey: ["app-release", "history"],
    queryFn: () => fetchReleaseHistory(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const history = historyData?.length
    ? historyData
    : DEFAULT_APP_RELEASE.history || [];

  /**
   * Dialog behaviour a full-screen modal owes keyboard and screen-reader users: focus moves in,
   * Tab cycles inside instead of wandering back to the page underneath, Escape closes, focus
   * returns where it came from, and the body behind stops scrolling.
   */
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog — otherwise a screen reader stays on the landing page and a
    // keyboard user's next Tab lands behind the overlay.
    const focusables =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables?.[0] ?? panelRef.current)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // If focus wandered outside the dialog, bring it back to the first element
      if (!panelRef.current?.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }

      // Wrap at both ends so focus can't escape to the page behind the overlay.
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only a click on the backdrop itself — not one that bubbled up from inside the panel.
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  const handleCopySha = () => {
    if (!release.sha256) return;
    navigator.clipboard.writeText(release.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  // Absolute so the QR is still meaningful once scanned on a phone; null when no release has
  // been published, in which case the download button and QR render as disabled rather than
  // linking to a file that isn't there.
  const downloadUrl = resolveApkUrl(release.apkUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300"
      onClick={handleBackdropClick}
    >
      {/*
        Painted with MD3 tokens rather than the legacy --background-* vars. Those resolved to the
        *light* surface while the content used text-white/text-gray-300, so once layout.tsx
        switched defaultTheme to "light" this modal rendered near-white text on a near-white panel.
      */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apk-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-outline-variant bg-surface-container-high text-on-surface p-6 md:p-8 shadow-2xl transition-all duration-300 focus:outline-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-surface-container-highest hover:bg-surface-container text-on-surface-variant transition-colors"
          aria-label="Close download dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2
                id="apk-modal-title"
                className="font-display text-headline-md text-on-surface"
              >
                MapAnytime Market
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-container text-on-primary-container border border-outline-variant">
                {release.channel} Release
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Official Android Release • Version{" "}
              <span className="font-semibold text-primary">
                v{release.version}
              </span>{" "}
              (Build {release.buildNumber})
            </p>
          </div>
        </div>

        {/* Device Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center text-xs text-on-surface-variant space-x-1.5 mb-1">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
              <span>Min Version</span>
            </div>
            <span className="text-sm font-semibold">
              {release.minAndroidVersion}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center text-xs text-on-surface-variant space-x-1.5 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-primary" />
              <span>APK Size</span>
            </div>
            <span className="text-sm font-semibold">{release.fileSize}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center text-xs text-on-surface-variant space-x-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-secondary" />
              <span>Architecture</span>
            </div>
            <span className="text-sm font-semibold">
              {release.architecture}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center text-xs text-on-surface-variant space-x-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-tertiary" />
              <span>Released</span>
            </div>
            <span className="text-sm font-semibold">
              {release.releaseDate || "—"}
            </span>
          </div>
        </div>

        {/* SHA-256 Hash Verification */}
        {release.sha256 && (
          <div className="mb-6 p-3.5 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-on-surface-variant truncate mr-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-semibold">SHA-256:</span>
              <span className="font-mono text-xs truncate">
                {release.sha256}
              </span>
            </div>
            <button
              onClick={handleCopySha}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container-highest hover:bg-surface-container-high transition-colors flex items-center space-x-1 flex-shrink-0"
            >
              {copiedSha ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* What's New Section */}
        <div className="mb-6 p-4 rounded-2xl bg-primary-container/40 border border-primary/20">
          <div className="flex items-center space-x-2 text-primary font-semibold mb-2.5 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>What&apos;s New in v{release.version}</span>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            {release.whatsNew.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Primary Download CTA Button */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download={`mapanytime-market-v${release.version}.apk`}
              className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-base shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>
                Download APK • v{release.version} ({release.fileSize})
              </span>
            </a>
          ) : (
            <div
              className="w-full py-4 px-6 rounded-2xl bg-surface-container border border-outline-variant text-on-surface-variant font-semibold text-base flex items-center justify-center space-x-3 cursor-not-allowed"
              role="status"
            >
              <Download className="w-5 h-5" />
              <span>No build published yet</span>
            </div>
          )}

          <button
            onClick={() => setShowQr(!showQr)}
            disabled={!downloadUrl}
            aria-expanded={showQr}
            className="w-full md:w-auto py-4 px-5 rounded-2xl bg-surface-container-highest hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed text-on-surface font-medium text-sm transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <QrIcon className="w-4 h-4" />
            <span>{showQr ? "Hide QR Code" : "Scan QR Code"}</span>
          </button>
        </div>

        {/* QR Code Section */}
        {showQr && downloadUrl && (
          <div className="mb-6 p-6 rounded-2xl bg-surface-container border border-outline-variant flex flex-col items-center justify-center text-center animate-fade-in">
            {/* Stays white in both themes on purpose — QR contrast is a scanning requirement,
                not a styling choice. */}
            <div className="p-3 bg-white rounded-2xl shadow-lg mb-3">
              <QRCodeSVG
                value={downloadUrl}
                size={160}
                level="M"
                title="Scan to download the MapAnytime APK"
                className="w-40 h-40 rounded-xl"
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              Scan this QR code with your phone camera to download directly to
              your mobile device.
            </p>
          </div>
        )}

        {/* 3-Step Visual Installation Guide */}
        <div className="mb-6 p-4 rounded-2xl bg-surface-container border border-outline-variant">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Quick Installation Guide</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {[
              {
                n: 1,
                title: "Download APK",
                body: "Click the download button above to save the file.",
              },
              {
                n: 2,
                title: "Allow Install",
                body: 'Tap "Allow from this source" if Android prompts.',
              },
              {
                n: 3,
                title: "Install & Open",
                body: "Tap Install to launch MapAnytime Market!",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="p-3 rounded-xl bg-surface-container-high flex items-start space-x-2.5"
              >
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center flex-shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">{step.title}</p>
                  <p className="text-on-surface-variant mt-0.5">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version History Section */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-outline-variant">
            <button
              onClick={() => setShowHistory(!showHistory)}
              aria-expanded={showHistory}
              className="w-full flex items-center justify-between text-xs text-on-surface-variant hover:text-on-surface transition-colors py-2"
            >
              <span>Version History ({history.length} builds)</span>
              {showHistory ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-on-surface">
                          v{item.version}
                        </span>
                        <span className="text-on-surface-variant">
                          (Build {item.buildNumber})
                        </span>
                        {item.isLatest && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-primary text-on-primary rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface-variant mt-0.5">
                        {item.fileSize || DEFAULT_APP_RELEASE.fileSize}
                      </p>
                    </div>
                    {resolveApkUrl(item.apkUrl) ? (
                      <a
                        href={resolveApkUrl(item.apkUrl) as string}
                        download={`mapanytime-v${item.version}.apk`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
