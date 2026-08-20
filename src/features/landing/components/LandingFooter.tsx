"use client";

import { Instagram, Linkedin, Youtube } from "lucide-react";
import { LogoIcon } from "./ui/LogoIcon";

const PRODUCT_LINKS = [
  { label: "Features", href: "#story" },
  { label: "How it works", href: "#story" },
  { label: "Pricing", href: "#pricing" },
  { label: "Map demo", href: "#claim" },
];

const COMPANY_LINKS = [
  { label: "About us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Blog", href: "/blog" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "/docs" },
  { label: "Help center", href: "/help" },
  { label: "Merchant guides", href: "/guides" },
];

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/mapanytime",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/mapanytime",
    icon: Instagram,
  },
  { label: "YouTube", href: "https://youtube.com/@mapanytime", icon: Youtube },
];

function handleCookieSettings() {
  console.log("TODO: open cookie preferences");
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#55717f]">
      {children}
    </h3>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            className="text-[12px] text-[#91aab6] transition duration-200 hover:text-[#8acddd]"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#01111c] px-6 pt-20 pb-10 max-landing-sm:px-4">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Main Grid: Increased gap and adjusted column distribution */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-16 pb-20 md:grid-cols-6 lg:grid-cols-6">
          {/* Brand & Bio: Spanning 2 columns on desktop for better readability */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-[7px] text-[13px] font-bold text-white">
              <LogoIcon iconSize={14} className="h-6 w-6 rounded-lg" />
              MapAnytime
            </div>
            <p className="mt-4 max-w-[280px] text-[12px] leading-[1.7] text-[#6f8996]">
              The map, photo, and pickup platform that puts independent shops
              online in 30 seconds — no delivery drivers, no wasted trips.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-[#91aab6] transition-all duration-300 hover:border-[#22d3ee]/30 hover:bg-[#22d3ee]/5 hover:text-[#8acddd]"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Columns: Using explicit column placement */}
          <div className="col-span-1">
            <FooterHeading>Product</FooterHeading>
            <FooterLinks links={PRODUCT_LINKS} />
          </div>

          <div className="col-span-1">
            <FooterHeading>Company</FooterHeading>
            <FooterLinks links={COMPANY_LINKS} />
          </div>

          <div className="col-span-1">
            <FooterHeading>Resources</FooterHeading>
            <FooterLinks links={RESOURCE_LINKS} />
          </div>
        </div>

        {/* Bottom bar: Enhanced padding and alignment */}
        <div className="flex flex-col-reverse justify-between gap-6 border-t border-white/[0.06] pt-8 md:flex-row md:items-center">
          <span className="text-[11px] text-[#55717f]">
            &copy; 2026 MapAnytime. All rights reserved.
          </span>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] text-[#55717f]">
            <a href="/privacy" className="transition hover:text-[#8acddd]">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-[#8acddd]">
              Terms of Service
            </a>
            <button
              type="button"
              onClick={handleCookieSettings}
              className="transition hover:text-[#8acddd]"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
