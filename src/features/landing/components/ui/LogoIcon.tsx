import Image from "next/image";
import clsx from "clsx";

interface LogoIconProps {
  /** Rendered height in px; the mark and the wordmark scale from it. */
  height?: number;
  priority?: boolean;
  /**
   * The surface it sits on. "Anytime" is brand blue on both, but the light blue that reads on the
   * dark page is too pale on light paper (the install pass), so light surfaces get a deeper blue.
   */
  tone?: "dark" | "light";
}

/**
 * The MapAnytime logo: the folded-map M (public/brand/mark.svg, the same mark as the favicon) and
 * the name set in the display face. "Map" takes the surrounding text colour, "Anytime" brand blue.
 */
export function LogoIcon({
  height = 36,
  priority = false,
  tone = "dark",
}: LogoIconProps) {
  return (
    <span
      className="inline-flex items-center"
      style={{ gap: Math.round(height * 0.22) }}
    >
      <Image
        src="/brand/mark.svg"
        alt=""
        width={64}
        height={64}
        priority={priority}
        unoptimized
        style={{ height, width: height }}
      />
      <span
        className="whitespace-nowrap font-extrabold leading-none tracking-[-0.03em] [font-family:var(--lp-display)]"
        style={{ fontSize: Math.round(height * 0.56) }}
      >
        Map
        <span
          className={clsx(
            tone === "dark" ? "text-[#7dbde6]" : "text-[#2a78ab]",
          )}
        >
          Anytime
        </span>
      </span>
    </span>
  );
}
