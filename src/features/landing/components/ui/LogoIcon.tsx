import Image from "next/image";

interface LogoIconProps {
  /** Rendered height in px; width follows the wordmark's 400x195 aspect ratio. */
  height?: number;
  priority?: boolean;
}

/** The MapAnytime wordmark, cropped from /logo.png to its visible area (transparent background). */
export function LogoIcon({ height = 36, priority = false }: LogoIconProps) {
  return (
    <Image
      src="/landing/logo-wordmark.png"
      alt="MapAnytime"
      width={400}
      height={195}
      priority={priority}
      style={{ height, width: "auto" }}
    />
  );
}
