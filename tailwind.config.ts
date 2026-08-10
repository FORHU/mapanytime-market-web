import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-tint": "var(--md-sys-color-surface-tint)",
        "primary-fixed-dim": "var(--md-sys-color-primary-fixed-dim)",
        "secondary-container": "var(--md-sys-color-secondary-container)",
        "secondary-fixed-dim": "var(--md-sys-color-secondary-fixed-dim)",
        "surface-container-high": "var(--md-sys-color-surface-container-high)",
        "on-tertiary-fixed-variant":
          "var(--md-sys-color-on-tertiary-fixed-variant)",
        "on-tertiary-fixed": "var(--md-sys-color-on-tertiary-fixed)",
        "primary-container": "var(--md-sys-color-primary-container)",
        "error-container": "var(--md-sys-color-error-container)",
        "surface-bright": "var(--md-sys-color-surface-bright)",
        "inverse-surface": "var(--md-sys-color-inverse-surface)",
        "surface-container-highest":
          "var(--md-sys-color-surface-container-highest)",
        "on-secondary-fixed": "var(--md-sys-color-on-secondary-fixed)",
        secondary: "var(--md-sys-color-secondary)",
        "surface-dim": "var(--md-sys-color-surface-dim)",
        "outline-variant": "var(--md-sys-color-outline-variant)",
        "surface-container-low": "var(--md-sys-color-surface-container-low)",
        "on-secondary": "var(--md-sys-color-on-secondary)",
        surface: "var(--md-sys-color-surface)",
        "on-primary": "var(--md-sys-color-on-primary)",
        "on-secondary-fixed-variant":
          "var(--md-sys-color-on-secondary-fixed-variant)",
        "on-background": "var(--md-sys-color-on-background)",
        background: "var(--md-sys-color-background)",
        "on-surface": "var(--md-sys-color-on-surface)",
        "inverse-primary": "var(--md-sys-color-inverse-primary)",
        "primary-fixed": "var(--md-sys-color-primary-fixed)",
        "secondary-fixed": "var(--md-sys-color-secondary-fixed)",
        tertiary: "var(--md-sys-color-tertiary)",
        primary: "var(--md-sys-color-primary)",
        "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
        "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
        "on-primary-fixed": "var(--md-sys-color-on-primary-fixed)",
        "on-error-container": "var(--md-sys-color-on-error-container)",
        "inverse-on-surface": "var(--md-sys-color-inverse-on-surface)",
        "tertiary-fixed-dim": "var(--md-sys-color-tertiary-fixed-dim)",
        "surface-container": "var(--md-sys-color-surface-container)",
        outline: "var(--md-sys-color-outline)",
        "on-primary-fixed-variant":
          "var(--md-sys-color-on-primary-fixed-variant)",
        "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
        "tertiary-fixed": "var(--md-sys-color-tertiary-fixed)",
        "tertiary-container": "var(--md-sys-color-tertiary-container)",
        "on-primary-container": "var(--md-sys-color-on-primary-container)",
        "on-tertiary": "var(--md-sys-color-on-tertiary)",
        "on-error": "var(--md-sys-color-on-error)",
        error: "var(--md-sys-color-error)",
        "surface-container-lowest":
          "var(--md-sys-color-surface-container-lowest)",
        "surface-variant": "var(--md-sys-color-surface-variant)",

        /*
         * Legacy aliases, kept only while non-landing pages migrate to the MD3 tokens above.
         *
         * The four `background-*` aliases are gone — nothing referenced `bg-background-primary`
         * and friends any more once the download modal moved to tokens. `brand-core` (6 sites)
         * and `brand-vibrant` (2) are still in use, so they stay until those are ported.
         *
         * Note this removes only the *Tailwind alias*. The underlying CSS variables in
         * globals.css (`--background-primary`, `--text-primary`, `--border-default`, …) are still
         * load-bearing: the admin and seller-onboarding pages reference them directly through
         * arbitrary values like `bg-[var(--background-secondary)]`. Deleting those variables is a
         * separate, larger migration.
         */
        "brand-core": "var(--brand-core)",
        "brand-vibrant": "var(--brand-vibrant)",
      },
      // borderRadius intentionally not extended — DEFAULT/lg/xl/full restated Tailwind's own
      // values, so the block did nothing but imply the scale had been customised.
      spacing: {
        "stack-md": "24px",
        "margin-mobile": "20px",
        "container-max": "1280px",
        "section-gap": "80px",
        "stack-sm": "12px",
        gutter: "24px",
        base: "8px",
      },
      /**
       * Family axis only — three fonts, three names.
       *
       * These keys used to mirror the `fontSize` keys below (`body-md`, `headline-lg`,
       * `button-text`, …), so `font-headline-lg` applied a family and nothing else while
       * `text-headline-lg` applied size/weight/tracking and nothing else. Two near-identical
       * class names with completely different effects, and eight family names for three actual
       * fonts. Type styles live in `fontSize` as `text-*`; families are `font-*`.
       *
       * Note `font-mono` now resolves to JetBrains Mono (the font the app already loads) rather
       * than Tailwind's default stack — that is the intent of loading it, and it makes the
       * existing `font-mono` sites consistent with `text-label-caps`.
       */
      fontFamily: {
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      /** Type styles — size, line-height, tracking, weight. Applied with `text-*`. */
      fontSize: {
        "headline-lg-mobile": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "button-text": ["16px", { lineHeight: "20px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "display-xl": [
          "72px",
          { lineHeight: "80px", letterSpacing: "-0.04em", fontWeight: "800" },
        ],
        "label-caps": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "700" },
        ],
      },
    },
  },
  plugins: [],
};
export default config;
