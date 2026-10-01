"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownRight, Play, QrCode, Smartphone } from "lucide-react";
import { Bezel } from "./ui/Bezel";
import { PillButton } from "./ui/PillButton";
import { Reveal } from "./ui/Reveal";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface LandingCTAProps {
  /** Resolved APK URL of the latest published release, or null when none is published. */
  downloadUrl: string | null;
  version: string;
  minAndroidVersion: string;
  fileSize: string;
  /** Opens the APK download dialog. */
  onInstall: () => void;
}

/**
 * Install section. The QR only renders when a release is actually published, so it can never scan
 * to a dead link; otherwise it says where the download will appear.
 */
export function LandingCTA({
  downloadUrl,
  version,
  minAndroidVersion,
  fileSize,
  onInstall,
}: LandingCTAProps) {
  const coreRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The glow follows the pointer and the QR card tilts toward it (fine pointers only).
  useEffect(() => {
    const core = coreRef.current;
    if (!core || reduce || !window.matchMedia("(pointer: fine)").matches)
      return;
    const glow = core.querySelector<HTMLElement>(".lp-inst__glow");
    const qr = core.querySelector<HTMLElement>(".lp-qr-shell");
    const onMove = (e: PointerEvent) => {
      const r = core.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      glow?.style.setProperty("--gx", `${e.clientX - r.left - 320}px`);
      glow?.style.setProperty("--gy", `${e.clientY - r.top - 320}px`);
      if (qr && window.innerWidth > 1000) {
        qr.style.setProperty("--ry", `${((px - 0.5) * 10).toFixed(2)}deg`);
        qr.style.setProperty("--rx", `${((0.5 - py) * 8).toFixed(2)}deg`);
      }
    };
    const onLeave = () => {
      qr?.style.setProperty("--ry", "0deg");
      qr?.style.setProperty("--rx", "0deg");
    };
    core.addEventListener("pointermove", onMove);
    core.addEventListener("pointerleave", onLeave);
    return () => {
      core.removeEventListener("pointermove", onMove);
      core.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <section
      id="install"
      className="lp-sec lp-sec--tight"
      aria-labelledby="lp-install-title"
    >
      <div className="lp-wrap">
        <Reveal>
          <div ref={coreRef}>
            <Bezel className="lp-inst">
              <span className="lp-inst__glow" aria-hidden="true" />
              <div>
                <h2 id="lp-install-title" className="lp-h2">
                  Your neighborhood, in your pocket.
                </h2>
                <p className="lp-lede">
                  Install the Android app to browse the live map, order ahead,
                  and track your pickups.
                </p>
                <PillButton
                  variant="sky"
                  icon={ArrowDownRight}
                  onClick={onInstall}
                  magnetic
                >
                  Install the App
                </PillButton>
                <div className="lp-soon">
                  <span>
                    <Smartphone aria-hidden="true" />
                    App Store <em>Soon</em>
                  </span>
                  <span>
                    <Play aria-hidden="true" />
                    Google Play <em>Soon</em>
                  </span>
                </div>
              </div>

              <div className="lp-qr-shell">
                <div className="lp-qr-core">
                  {downloadUrl ? (
                    <div className="lp-qr">
                      <QRCodeSVG
                        value={downloadUrl}
                        size={140}
                        fgColor="#0E1A23"
                        bgColor="#FFFFFF"
                        title="QR code to download the MapAnytime Android app"
                      />
                    </div>
                  ) : (
                    <div className="lp-qr lp-qr--empty" aria-hidden="true">
                      <QrCode />
                    </div>
                  )}
                  <div className="lp-rel">
                    <b>
                      {downloadUrl
                        ? "Scan to download on Android"
                        : "Android download"}
                    </b>
                    {!downloadUrl && (
                      <p>
                        The download will appear here once it&apos;s published.
                      </p>
                    )}
                    <dl>
                      <dt>Version</dt>
                      <dd>{version}</dd>
                      <dt>Requires</dt>
                      <dd>{minAndroidVersion}</dd>
                      <dt>Size</dt>
                      <dd>{fileSize}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Bezel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
