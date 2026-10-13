"use client";

import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { MouseEventHandler, ReactNode, Ref } from "react";
import { useMagnetic } from "@/features/landing/hooks/useMagnetic";

type Variant = "primary" | "quiet" | "dark" | "sky";

interface CommonProps {
  variant?: Variant;
  size?: "md" | "sm";
  /** Trailing icon, rendered inside its own circle. */
  icon: LucideIcon;
  /** Pull toward the cursor on hover (fine pointers only, respects reduced motion). */
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

type LinkProps = CommonProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type PillButtonProps = LinkProps | ButtonProps;

/**
 * Pill CTA with the icon nested in its own circle. Routes (`/…`) render a Next link, anchors
 * (`#…`) and external URLs a plain `<a>`, and anything without `href` a `<button>`.
 */
export function PillButton(props: PillButtonProps) {
  const {
    variant = "primary",
    size = "md",
    icon: Icon,
    magnetic = false,
    className,
    children,
  } = props;
  const ref = useMagnetic<HTMLElement>(magnetic);

  const classes = clsx(
    "lp-btn",
    `lp-btn--${variant}`,
    size === "sm" && "lp-btn--sm",
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      <span className="lp-btn__ico" aria-hidden="true">
        <Icon />
      </span>
    </>
  );

  if (props.href === undefined) {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        onClick={props.onClick}
      >
        {content}
      </button>
    );
  }

  if (props.href.startsWith("/")) {
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        href={props.href}
        className={classes}
        onClick={props.onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      ref={ref as Ref<HTMLAnchorElement>}
      href={props.href}
      className={classes}
      onClick={props.onClick}
    >
      {content}
    </a>
  );
}
