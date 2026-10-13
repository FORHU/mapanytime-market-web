"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoIcon } from "./ui/LogoIcon";
import { CookieSettingsDialog } from "@/shared/components/CookieSettingsDialog";
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "../landing.content";
import { usePointerGlow } from "../hooks/usePointerGlow";

function FooterLink({ label, href }: { label: string; href: string }) {
  return href.startsWith("/") ? (
    <Link href={href}>{label}</Link>
  ) : (
    <a href={href}>{label}</a>
  );
}

export function LandingFooter() {
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const giantRef = usePointerGlow<HTMLDivElement>();

  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-foot">
          <div>
            <a href="#top" aria-label="MapAnytime home" className="inline-flex">
              <LogoIcon height={44} />
            </a>
            <p>A live map of local stores you can shop from and pick up at.</p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
                {col.title === "Legal" && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setCookieSettingsOpen(true)}
                    >
                      Cookie settings
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-base">
          <span>&copy; 2026 MapAnytime</span>
          <div className="lp-social">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div ref={giantRef} className="lp-giant" aria-hidden="true">
        MapAnytime
      </div>

      <CookieSettingsDialog
        open={cookieSettingsOpen}
        onClose={() => setCookieSettingsOpen(false)}
      />
    </footer>
  );
}
