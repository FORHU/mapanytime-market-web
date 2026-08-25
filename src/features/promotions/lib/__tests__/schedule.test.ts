import { describe, it, expect } from "vitest";
import {
  wallClockToIso,
  isoToWallClock,
  formatDuration,
  timeZoneAbbreviation,
} from "../schedule";

const MANILA = "Asia/Manila";
const NEW_YORK = "America/New_York";

describe("wallClockToIso — the store's zone decides the instant", () => {
  it("resolves a Manila wall-clock against +08:00, not the test runner's zone", () => {
    // 09:00 in Manila is 01:00 UTC. This is the bug the module exists to fix:
    // the old form used new Date("...T09:00"), which the browser read locally.
    expect(wallClockToIso("2026-09-03", "09:00", MANILA)).toBe(
      "2026-09-03T01:00:00.000Z",
    );
  });

  it("keeps minute precision", () => {
    expect(wallClockToIso("2026-09-03", "09:37", MANILA)).toBe(
      "2026-09-03T01:37:00.000Z",
    );
  });

  it("pins seconds to zero rather than inventing precision the UI never offered", () => {
    const iso = wallClockToIso("2026-09-03", "23:59", MANILA);
    expect(iso?.endsWith(":00.000Z")).toBe(true);
  });

  it("returns undefined for a blank date so an empty field means 'unset'", () => {
    expect(wallClockToIso("", "09:00", MANILA)).toBeUndefined();
  });

  it("returns undefined for an unparseable date instead of an Invalid Date", () => {
    expect(wallClockToIso("not-a-date", "09:00", MANILA)).toBeUndefined();
  });

  it("defaults a blank time to midnight", () => {
    expect(wallClockToIso("2026-09-03", "", MANILA)).toBe(
      "2026-09-02T16:00:00.000Z",
    );
  });
});

describe("wallClockToIso — daylight saving", () => {
  // Manila has no DST, so these run against New York. The point is that the
  // offset is resolved for that specific date rather than assumed constant —
  // which is why the zone name is stored and not a fixed "+08:00".
  it("uses the standard-time offset before the spring transition", () => {
    // 2026-03-08 02:00 EST → DST begins. 01:00 EST is UTC-5.
    expect(wallClockToIso("2026-03-08", "01:00", NEW_YORK)).toBe(
      "2026-03-08T06:00:00.000Z",
    );
  });

  it("uses the daylight-time offset after the spring transition", () => {
    // 03:00 EDT is UTC-4.
    expect(wallClockToIso("2026-03-08", "03:00", NEW_YORK)).toBe(
      "2026-03-08T07:00:00.000Z",
    );
  });

  it("resolves a nonexistent wall-clock forward rather than throwing", () => {
    // 02:30 on a spring-forward date does not exist. It must produce a real
    // instant, not an Invalid Date that reaches the API as null.
    const iso = wallClockToIso("2026-03-08", "02:30", NEW_YORK);
    expect(iso).toBeDefined();
    expect(Number.isNaN(new Date(iso as string).getTime())).toBe(false);
  });

  it("resolves an ambiguous wall-clock to a single instant", () => {
    // 2026-11-01 01:30 occurs twice. Either is defensible; what matters is
    // that it is deterministic and valid.
    const iso = wallClockToIso("2026-11-01", "01:30", NEW_YORK);
    expect(iso).toBeDefined();
    expect(Number.isNaN(new Date(iso as string).getTime())).toBe(false);
  });
});

describe("isoToWallClock round-trips", () => {
  it("returns the same wall-clock the seller typed", () => {
    const iso = wallClockToIso("2026-09-03", "09:00", MANILA) as string;
    expect(isoToWallClock(iso, MANILA)).toEqual({
      date: "2026-09-03",
      time: "09:00",
    });
  });

  it("zero-pads single-digit months, days, hours and minutes", () => {
    const iso = wallClockToIso("2026-01-05", "07:05", MANILA) as string;
    expect(isoToWallClock(iso, MANILA)).toEqual({
      date: "2026-01-05",
      time: "07:05",
    });
  });

  it("renders the same instant differently in a different zone", () => {
    const iso = wallClockToIso("2026-09-03", "09:00", MANILA) as string;
    expect(isoToWallClock(iso, "Asia/Tokyo")).toEqual({
      date: "2026-09-03",
      time: "10:00",
    });
  });

  it("treats a null instant as empty fields", () => {
    expect(isoToWallClock(null, MANILA)).toEqual({ date: "", time: "" });
  });
});

describe("formatDuration", () => {
  it("reports minutes for short windows", () => {
    expect(formatDuration(5 * 60000)).toBe("5 minutes");
  });

  it("singularises one minute", () => {
    expect(formatDuration(60000)).toBe("1 minute");
  });

  it("combines days and hours", () => {
    expect(formatDuration(3 * 86400000 + 9 * 3600000)).toBe("3 days, 9 hours");
  });

  it("drops minutes once the window is measured in days", () => {
    expect(formatDuration(3 * 86400000 + 9 * 3600000 + 120000)).toBe(
      "3 days, 9 hours",
    );
  });

  it("reports a non-positive window as zero rather than a negative string", () => {
    expect(formatDuration(-5000)).toBe("0 minutes");
  });
});

describe("timeZoneAbbreviation", () => {
  it("gives Manila a GMT+8 label", () => {
    expect(timeZoneAbbreviation(MANILA)).toBe("GMT+8");
  });

  it("returns an empty string for an invalid zone instead of throwing", () => {
    expect(timeZoneAbbreviation("Not/AZone")).toBe("");
  });
});
