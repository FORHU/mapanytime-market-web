/**
 * How long a rejected store has left before the backend deletes it.
 *
 * The deadline is always the server's `scheduledDeletionAt`; nothing here adds
 * 24 hours to anything. That matters because the sweep is what actually enforces
 * the window, and a second copy of its length living in the browser could
 * disagree with it after any change to the backend constant.
 *
 * `features/promotions/lib/schedule.ts` has a near-identical formatter, but
 * feature isolation forbids importing across features, so this is deliberately
 * its own small copy rather than a shared import.
 */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Whole units only, and never more precision than the sentence needs: a card
 * that says "17 hours, 42 minutes, 9 seconds" reads as a stopwatch, and the
 * seller is being told roughly how long they have, not timed.
 */
export function formatTimeRemaining(
  scheduledDeletionAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!scheduledDeletionAt) return null;

  const deadline = new Date(scheduledDeletionAt);
  if (Number.isNaN(deadline.getTime())) return null;

  const remaining = deadline.getTime() - now.getTime();

  // Past the deadline the store is waiting on the next hourly sweep rather than
  // already gone, so this must not claim it has been deleted.
  if (remaining <= 0) return "any moment now";

  if (remaining < HOUR) {
    const minutes = Math.max(1, Math.floor(remaining / MINUTE));
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(remaining / HOUR);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/** The full sentence the seller reads on a rejected store's card. */
export function deletionWarning(
  scheduledDeletionAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const remaining = formatTimeRemaining(scheduledDeletionAt, now);
  if (!remaining) return null;

  return remaining === "any moment now"
    ? "This store will be deleted any moment now."
    : `This store will be automatically deleted in ${remaining}.`;
}
