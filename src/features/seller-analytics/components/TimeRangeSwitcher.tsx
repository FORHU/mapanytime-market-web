import React from "react";

const RANGES = [
  { token: "7d", label: "7 days" },
  { token: "30d", label: "30 days" },
  { token: "90d", label: "90 days" },
] as const;

interface TimeRangeSwitcherProps {
  /** The range shown as selected while the control is inert. */
  activeToken?: (typeof RANGES)[number]["token"];
}

/**
 * Range control, rendered disabled.
 *
 * The page runs on a fixture, so offering a working switch would imply the
 * figures respond to it. Every button is genuinely `disabled`, which also takes
 * them out of the tab order, so there is nothing to focus into and no dead end.
 * The reason is spelled out in text rather than a `title` tooltip, because a
 * tooltip on a disabled control is unreachable by keyboard and touch.
 */
export function TimeRangeSwitcher({
  activeToken = "30d",
}: TimeRangeSwitcherProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <div
        className="flex bg-[var(--background-secondary)] p-1 rounded-xl border border-[var(--border-light)] w-full sm:w-auto"
        role="group"
        aria-label="Reporting period"
      >
        {RANGES.map(({ token, label }) => {
          const isActive = token === activeToken;
          return (
            <button
              key={token}
              type="button"
              disabled
              aria-pressed={isActive}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg cursor-not-allowed ${
                isActive
                  ? "bg-[var(--background-tertiary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        Period filtering arrives with live data.
      </p>
    </div>
  );
}
