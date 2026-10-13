"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowDownRight } from "lucide-react";
import { LogoIcon } from "./ui/LogoIcon";
import { PillButton } from "./ui/PillButton";
import { NAV_LINKS } from "../landing.content";

interface LandingNavProps {
  /** Where a signed-in user's dashboard lives; when set, "Log in" becomes "Dashboard". */
  homeRoute?: string | null;
}

/** Floating island nav. Below 900px the links move into a full-screen menu behind a morphing burger. */
export function LandingNav({ homeRoute }: LandingNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const account = homeRoute
    ? { label: "Dashboard", href: homeRoute }
    : { label: "Log in", href: "/login" };
  const close = () => setOpen(false);

  return (
    <div className={clsx(open && "lp-menu-open")}>
      <header className="lp-island">
        <a href="#top" aria-label="MapAnytime home" className="flex">
          <LogoIcon height={34} priority />
        </a>
        <nav aria-label="Primary" className="lp-island__links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="lp-island__link">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="lp-island__right">
          <Link
            href={account.href}
            className="lp-island__link lp-island__login"
          >
            {account.label}
          </Link>
          <PillButton href="#install" size="sm" icon={ArrowDownRight}>
            Install the App
          </PillButton>
          <button
            type="button"
            className="lp-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="lp-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="lp-menu" className="lp-overlay" aria-hidden={!open}>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={close}
            tabIndex={open ? 0 : -1}
            style={{ "--i": i } as CSSProperties}
          >
            {link.label}
          </a>
        ))}
        <Link
          href={account.href}
          onClick={close}
          tabIndex={open ? 0 : -1}
          style={{ "--i": NAV_LINKS.length } as CSSProperties}
        >
          {account.label}
        </Link>
      </div>
    </div>
  );
}
