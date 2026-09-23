import React from "react";

interface SectionHeadingProps {
  title: string;
  /** One functional sentence. Skip it when the title already says everything. */
  description?: string;
  /** Right-aligned slot for a control or a summary figure. */
  action?: React.ReactNode;
}

/**
 * Section title for the analytics page.
 *
 * Plain sentence case at `text-base font-semibold`, deliberately not the small
 * uppercase wide-tracking label style. That style is reserved here for stat-tile
 * labels and table headers, so putting it above every section too would flatten
 * the hierarchy into one texture.
 */
export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-1 min-w-0">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
