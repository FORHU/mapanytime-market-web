"use client";

import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="bg-surface-dim mt-auto border-t border-surface-container-low transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-md px-margin-mobile md:px-gutter py-section-gap max-w-container-max mx-auto">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link
            href="/"
            className="font-display text-headline-md font-bold text-primary"
          >
            MapAnytime
          </Link>
          <p className="font-body text-body-md text-on-surface-variant max-w-sm transition-colors">
            © 2026 MapAnytime. Bridging digital discovery and physical
            neighborhood commerce.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="font-display text-button-text text-on-surface transition-colors">
            Platform
          </h4>
          <ul className="space-y-2 flex flex-col">
            <Link
              href="#"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Marketplace Categories
            </Link>
            <Link
              href="#"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Active Stores
            </Link>
            <Link
              href="/seller"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Merchant Hub
            </Link>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-display text-button-text text-on-surface transition-colors">
            Legal & Support
          </h4>
          <ul className="space-y-2 flex flex-col">
            <Link
              href="#"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="font-body text-body-md text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              Contact Support
            </Link>
          </ul>
        </div>
      </div>
    </footer>
  );
}
