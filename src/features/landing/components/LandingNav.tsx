"use client";

import clsx from "clsx";
import { LogoIcon } from "./ui/LogoIcon";
import Link from "next/link";

interface LandingNavProps {
  scrolled: boolean;
}

export function LandingNav({ scrolled }: LandingNavProps) {
  return (
    <header
      className={clsx(
        "fixed left-0 right-0 top-0 z-50 border-b border-transparent transition duration-300 ease-out",
        scrolled &&
          "border-white/[0.08] bg-[rgba(2,21,33,0.84)] backdrop-blur-[20px]",
      )}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-6 max-landing-sm:px-4">
        <a
          href="#"
          className="flex items-center gap-[9px] text-[15px] font-extrabold tracking-[-0.03em] text-white"
        >
          <LogoIcon
            iconSize={17}
            className="h-[31px] w-[31px] rounded-[10px]"
          />
          <span>MapAnytime</span>
        </a>

        <nav className="ml-auto mr-[30px] hidden items-center gap-[30px] landing-lg:flex">
          <a
            href="#benefits"
            className="text-[11px] font-semibold text-[#7693a1] transition duration-200 hover:text-white"
          >
            Why MapAnytime
          </a>
          <a
            href="#story"
            className="text-[11px] font-semibold text-[#7693a1] transition duration-200 hover:text-white"
          >
            Our vision
          </a>
        </nav>
        <Link
          href="/register"
          className="text-[11px] font-semibold text-[#7693a1] transition duration-200 hover:text-white mr-4"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-[7px] rounded-full border border-white/[0.13] bg-white/[0.06] px-4 py-[10px] text-[11px] font-bold text-white transition duration-[250ms] hover:-translate-y-0.5 hover:border-[rgba(34,211,238,0.4)] hover:bg-[rgba(34,211,238,0.1)] max-landing-sm:px-[11px] max-landing-sm:py-2 max-landing-sm:text-[9px]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
