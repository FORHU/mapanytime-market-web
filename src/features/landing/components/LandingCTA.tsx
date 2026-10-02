"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownRight, QrCode } from "lucide-react";
import { LogoIcon } from "./ui/LogoIcon";
import { PillButton } from "./ui/PillButton";
import { Reveal } from "./ui/Reveal";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface InstallableRelease {
  version: string;
  minAndroidVersion: string;
  fileSize: string;
}

interface LandingCTAProps {
  /**
   * The API's install link, or null until an admin makes a version downloadable. It names no
   * version or storage path: the API redirects it to whichever version is currently selected.
   */
  downloadUrl: string | null;
  /** The version that link currently serves, for the details card. */
  release: InstallableRelease | null;
  /** Opens the download dialog (version details, checksum, install guide). */
  onShowDetails: () => void;
}

/* Fades the map into the page at the top and bottom, and darkens the side the copy sits on. */
const VEIL: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--lp-bg) 0%, rgba(7,13,18,0) 22%, rgba(7,13,18,0) 78%, var(--lp-bg) 100%), linear-gradient(90deg, var(--lp-bg) 0%, rgba(7,13,18,0.86) 38%, rgba(7,13,18,0.35) 70%, rgba(7,13,18,0.55) 100%)",
};

/*
 * The pass's paper with two half-circle notches cut where the tear line runs. The stub below the
 * line has a fixed height, so the notches sit a fixed distance from the bottom.
 */
const STUB = 96;
const NOTCHES = [
  `radial-gradient(circle 16px at 0 calc(100% - ${STUB}px), transparent 15.5px, #000 16px) left / 51% 100% no-repeat`,
  `radial-gradient(circle 16px at 100% calc(100% - ${STUB}px), transparent 15.5px, #000 16px) right / 51% 100% no-repeat`,
].join(", ");
const PAPER: CSSProperties = { WebkitMask: NOTCHES, mask: NOTCHES };

const FACT_LABEL =
  "[font-family:var(--lp-mono)] text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#5e6e7a]";
const FACT_VALUE =
  "mt-1 whitespace-nowrap [font-family:var(--lp-mono)] text-[13px] font-medium md:text-[14px]";

/**
 * Install section. "Install the App" downloads the selected APK directly; the QR encodes the same
 * link. With nothing downloadable yet, the button opens the dialog instead and the QR slot says
 * where the download will appear, so nothing on the page ever points at a missing file.
 *
 * The download is drawn as a pass, the same object the How it works story ends on: paper, a big
 * code to scan, a tear line, and the release facts on the stub.
 */
export function LandingCTA({
  downloadUrl,
  release,
  onShowDetails,
}: LandingCTAProps) {
  const bandRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const passRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const available = Boolean(downloadUrl && release);

  // The glow follows the pointer and the pass tilts toward it (fine pointers only).
  useEffect(() => {
    const band = bandRef.current;
    if (!band || reduce || !window.matchMedia("(pointer: fine)").matches)
      return;
    const onMove = (e: PointerEvent) => {
      const r = band.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      glowRef.current?.style.setProperty(
        "--gx",
        `${e.clientX - r.left - 320}px`,
      );
      glowRef.current?.style.setProperty(
        "--gy",
        `${e.clientY - r.top - 320}px`,
      );
      if (window.innerWidth > 1023) {
        passRef.current?.style.setProperty(
          "--ry",
          `${((px - 0.5) * 10).toFixed(2)}deg`,
        );
        passRef.current?.style.setProperty(
          "--rx",
          `${((0.5 - py) * 8).toFixed(2)}deg`,
        );
      }
    };
    const onLeave = () => {
      passRef.current?.style.setProperty("--ry", "0deg");
      passRef.current?.style.setProperty("--rx", "0deg");
    };
    band.addEventListener("pointermove", onMove);
    band.addEventListener("pointerleave", onLeave);
    return () => {
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <section
      ref={bandRef}
      id="install"
      aria-labelledby="lp-install-title"
      className="relative isolate scroll-mt-24 overflow-hidden px-4 pb-24 pt-[88px] md:px-8 md:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-[2]">
        <Image
          src="/landing/app-map.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_50%] opacity-[0.32] saturate-[0.7]"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[1]"
        style={VEIL}
      />
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-[1] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(100,172,218,0.2),transparent)] [transform:translate(var(--gx,60vw),var(--gy,10%))] [transition:transform_1.4s_var(--lp-out)]"
      />

      <div className="mx-auto grid max-w-[1176px] grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <Reveal className="grid justify-items-start gap-7">
          <h2
            id="lp-install-title"
            className="pb-[0.04em] text-[clamp(48px,6.4vw,104px)] font-extrabold leading-[0.92] tracking-[-0.055em]"
          >
            Take the map{" "}
            <em className="block not-italic text-[var(--lp-brand-deep)]">
              with you.
            </em>
          </h2>
          <p className="max-w-[38ch] text-[17px] text-[var(--lp-ink-2)] md:text-[clamp(17px,1.5vw,20px)]">
            Install the Android app to browse the live map, order ahead, and
            track your pickups.
          </p>
          <div className="flex w-full flex-wrap items-center gap-x-[22px] gap-y-3.5 lg:w-auto [&>.lp-btn]:max-lg:flex-1 [&>.lp-btn]:max-lg:justify-between">
            {available && downloadUrl ? (
              <PillButton href={downloadUrl} icon={ArrowDownRight} magnetic>
                Install the App
              </PillButton>
            ) : (
              <PillButton
                icon={ArrowDownRight}
                onClick={onShowDetails}
                magnetic
              >
                Install the App
              </PillButton>
            )}
            {available && (
              <button
                type="button"
                onClick={onShowDetails}
                className="rounded px-0.5 py-2 [font-family:var(--lp-display)] text-[15px] font-semibold text-[var(--lp-ink-2)] underline decoration-[var(--lp-hair-2)] underline-offset-4 transition-colors duration-300 hover:text-[var(--lp-ink)] hover:decoration-[var(--lp-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--lp-action)]"
              >
                Version details
              </button>
            )}
          </div>
          <p className="text-[14px] text-[var(--lp-ink-3)]">
            App Store and Google Play versions are coming soon.
          </p>
        </Reveal>

        <Reveal
          className="w-full max-w-[340px] justify-self-center [perspective:1100px] lg:max-w-[380px] lg:justify-self-end"
          delay={1}
        >
          <div
            ref={passRef}
            className="text-[#0e1a23] [filter:drop-shadow(0_40px_50px_rgba(0,0,0,0.55))_drop-shadow(0_0_60px_rgba(74,162,218,0.18))] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_rotate(-3deg)] [transition:transform_0.9s_var(--lp-spring)]"
          >
            <div className="rounded-[26px] bg-[#eef3f6]" style={PAPER}>
              <div className="grid justify-items-center gap-5 px-5 pb-[22px] pt-5 md:px-[26px] md:pb-[26px] md:pt-[22px]">
                <div className="flex w-full items-center justify-between">
                  <LogoIcon height={30} tone="light" />
                  <span className={FACT_LABEL}>Android</span>
                </div>
                {available && downloadUrl ? (
                  <QRCodeSVG
                    value={downloadUrl}
                    size={220}
                    fgColor="#0E1A23"
                    bgColor="#EEF3F6"
                    title="QR code to download the MapAnytime Android app"
                    className="h-[180px] w-[180px] md:h-[220px] md:w-[220px]"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="grid h-[180px] w-[180px] place-items-center rounded-[18px] border-2 border-dashed border-[rgba(14,26,35,0.18)] text-[#5e6e7a] md:h-[220px] md:w-[220px]"
                  >
                    <QrCode className="h-11 w-11" strokeWidth={1.5} />
                  </div>
                )}
                <b className="text-center [font-family:var(--lp-display)] text-[16px] font-bold tracking-[-0.01em]">
                  {available
                    ? "Scan to download on Android"
                    : "Android download"}
                </b>
              </div>

              <div
                aria-hidden="true"
                className="mx-5 border-t-2 border-dashed border-[rgba(14,26,35,0.2)] md:mx-[26px]"
              />

              <div
                className="grid content-start px-5 pt-4 md:px-[26px] md:pt-[18px]"
                style={{ height: STUB }}
              >
                {available && release ? (
                  <dl className="m-0 grid grid-cols-[repeat(3,auto)] justify-between gap-3">
                    <div>
                      <dt className={FACT_LABEL}>Version</dt>
                      <dd className={FACT_VALUE}>{release.version}</dd>
                    </div>
                    <div>
                      <dt className={FACT_LABEL}>Requires</dt>
                      <dd className={FACT_VALUE}>
                        {release.minAndroidVersion}
                      </dd>
                    </div>
                    <div>
                      <dt className={FACT_LABEL}>Size</dt>
                      <dd className={FACT_VALUE}>{release.fileSize}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-center text-[14px] text-[#5e6e7a]">
                    The download will appear here once it&apos;s published.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
