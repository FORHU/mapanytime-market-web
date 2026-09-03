/**
 * Peso formatting for the whole app.
 *
 * The platform trades in PHP only. Amounts were being rendered with a `$`
 * prefix in more than one place, which is not a cosmetic slip on a page an
 * operator reads figures off.
 */
export function formatPeso(
  amount: number | string | null | undefined,
  options: { decimals?: boolean } = {},
): string {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "₱0.00";

  const decimals = options.decimals ?? true;
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

/** Compact form for axis ticks and tiles — ₱1.2k, ₱3.4M. */
export function formatPesoCompact(
  amount: number | string | null | undefined,
): string {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return "₱0";

  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₱${(value / 1_000).toFixed(1)}k`;
  return `₱${value.toFixed(0)}`;
}
