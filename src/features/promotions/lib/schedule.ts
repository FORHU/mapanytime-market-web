import { TZDate } from "@date-fns/tz";

/**
 * Converting between the wall-clock a seller types and the UTC instant stored.
 *
 * The rule this module exists to enforce: a scheduled time means what it says
 * *in the store's timezone*, not in whatever zone the seller's laptop happens
 * to be set to. The old form did `new Date("2026-09-03T23:59:59")`, which the
 * browser reads in its own local zone — so the same picked date produced a
 * different instant depending on where the seller was sitting.
 */

export const DEFAULT_TIME_ZONE = "Asia/Manila";

/** Sensible defaults so a seller who ignores the time fields gets whole days. */
export const DEFAULT_START_TIME = "00:00";
export const DEFAULT_END_TIME = "23:59";

export type WallClock = { date: string; time: string };

export function browserTimeZone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
    );
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/**
 * "2026-09-03" + "09:00" in Asia/Manila → the matching UTC ISO instant.
 *
 * TZDate resolves the offset for that specific date in that zone, so a DST
 * transition between now and then is accounted for rather than assumed away.
 */
export function wallClockToIso(
  date: string,
  time: string,
  timeZone: string,
): string | undefined {
  if (!date) return undefined;

  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "00:00").split(":").map(Number);

  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return undefined;

  // Month is 0-indexed. Seconds are pinned to 0 — the UI offers minute
  // granularity, so anything finer would be invented data.
  const zoned = new TZDate(y, m - 1, d, hh, mm, 0, 0, timeZone);
  return new Date(zoned.getTime()).toISOString();
}

/** The inverse: a stored UTC instant → the date and time fields to show. */
export function isoToWallClock(
  iso: string | null | undefined,
  timeZone: string,
): WallClock {
  if (!iso) return { date: "", time: "" };

  const zoned = new TZDate(new Date(iso), timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    date: `${zoned.getFullYear()}-${pad(zoned.getMonth() + 1)}-${pad(zoned.getDate())}`,
    time: `${pad(zoned.getHours())}:${pad(zoned.getMinutes())}`,
  };
}

/** e.g. "GMT+8" — appended to the zone name so the label is readable at a glance. */
export function timeZoneAbbreviation(
  timeZone: string,
  at: Date = new Date(),
): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

export function formatInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(iso));
}

/** "3 days, 9 hours" — reads as a sentence, which is what catches AM/PM slips. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0 minutes";

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  // Minutes are dropped once the window is measured in days — "3 days, 9 hours,
  // 2 minutes" is precision no seller asked for.
  if (minutes && !days)
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);

  return parts.join(", ") || "0 minutes";
}

/** "in 2 hours" / "6 days ago" — the relative half of the schedule summary. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const deltaMs = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(deltaMs);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];

  for (const [unit, msPer] of units) {
    if (abs >= msPer) return rtf.format(Math.round(deltaMs / msPer), unit);
  }
  return deltaMs >= 0 ? "in less than a minute" : "just now";
}

export const MIN_WINDOW_MS = 5 * 60 * 1000;
export const START_GRACE_MS = 120 * 1000;
