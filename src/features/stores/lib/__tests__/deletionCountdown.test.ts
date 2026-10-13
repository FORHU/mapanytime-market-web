import { describe, it, expect } from "vitest";
import { deletionWarning, formatTimeRemaining } from "../deletionCountdown";

/**
 * Every case pins `now` rather than using the clock: the whole point of the
 * helper is the distance between two instants, and a test that reads the real
 * time proves nothing about that distance.
 */
describe("formatTimeRemaining", () => {
  const NOW = new Date("2026-09-09T12:00:00.000Z");

  it("counts whole hours while more than one remains", () => {
    expect(formatTimeRemaining("2026-09-10T06:00:00.000Z", NOW)).toBe(
      "18 hours",
    );
  });

  it("drops to minutes inside the last hour", () => {
    expect(formatTimeRemaining("2026-09-09T12:45:00.000Z", NOW)).toBe(
      "45 minutes",
    );
  });

  it("singularises one hour and one minute", () => {
    expect(formatTimeRemaining("2026-09-09T13:00:00.000Z", NOW)).toBe("1 hour");
    expect(formatTimeRemaining("2026-09-09T12:01:00.000Z", NOW)).toBe(
      "1 minute",
    );
  });

  it("rounds down rather than up", () => {
    // 17h59m is "17 hours", not "18" — the deadline must never arrive sooner
    // than the card said it would.
    expect(formatTimeRemaining("2026-09-10T05:59:00.000Z", NOW)).toBe(
      "17 hours",
    );
  });

  // The sweep runs hourly, so a store can sit past its deadline for up to an
  // hour. Saying "0 minutes" or a negative count would read as a bug.
  it("says the deletion is imminent once the deadline has passed", () => {
    expect(formatTimeRemaining("2026-09-09T11:00:00.000Z", NOW)).toBe(
      "any moment now",
    );
  });

  it("never reports zero in the final seconds", () => {
    expect(formatTimeRemaining("2026-09-09T12:00:30.000Z", NOW)).toBe(
      "1 minute",
    );
  });

  it.each([[null], [undefined], [""], ["not a date"]])(
    "returns null for %s rather than inventing a deadline",
    (value) => {
      expect(formatTimeRemaining(value as string | null, NOW)).toBeNull();
    },
  );
});

describe("deletionWarning", () => {
  const NOW = new Date("2026-09-09T12:00:00.000Z");

  it("reads as a sentence the seller can act on", () => {
    expect(deletionWarning("2026-09-10T06:00:00.000Z", NOW)).toBe(
      "This store will be automatically deleted in 18 hours.",
    );
  });

  it("does not say 'in any moment now'", () => {
    expect(deletionWarning("2026-09-09T11:00:00.000Z", NOW)).toBe(
      "This store will be deleted any moment now.",
    );
  });

  it("stays silent without a deadline", () => {
    expect(deletionWarning(null, NOW)).toBeNull();
  });
});
