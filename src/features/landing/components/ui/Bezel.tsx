import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface BezelProps extends HTMLAttributes<HTMLDivElement> {
  size?: "md" | "sm";
  coreClassName?: string;
  /** Marks the inner core as a target for the bento's pointer glow. */
  glow?: boolean;
  children: ReactNode;
}

/**
 * Double-bezel container: an outer tray with a hairline and an inner core with its own highlight
 * and a concentric, slightly smaller radius.
 */
export function Bezel({
  size = "md",
  className,
  coreClassName,
  glow,
  children,
  ...rest
}: BezelProps) {
  return (
    <div
      className={clsx("lp-shell", size === "sm" && "lp-shell--sm", className)}
      {...rest}
    >
      <div
        className={clsx("lp-core", coreClassName)}
        data-glow={glow ? "" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
