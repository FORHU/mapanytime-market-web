import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ClampedNote } from "../ClampedNote";

/**
 * The note block on cards people scan.
 *
 * It exists because a reviewer can write a thousand characters with no spaces
 * in them, which has no break opportunity and — worse — an enormous intrinsic
 * min-content width that a grid or flex track will happily stretch to fit,
 * dragging the whole page into horizontal scroll.
 *
 * jsdom does no layout, so overflow is simulated by stubbing the two
 * measurements the component reads. The wrapping itself is a CSS property and
 * is checked by class, not by rendered geometry.
 */

/** jsdom reports 0 for both; force the ratio the component branches on. */
function stubOverflow({ overflowing }: { overflowing: boolean }) {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => (overflowing ? 200 : 40),
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => 40,
  });
}

afterEach(() => {
  // @ts-expect-error restoring the jsdom defaults
  delete HTMLElement.prototype.scrollHeight;
  // @ts-expect-error restoring the jsdom defaults
  delete HTMLElement.prototype.clientHeight;
  vi.restoreAllMocks();
});

const LONG = "a".repeat(1000);

describe("ClampedNote", () => {
  it("keeps the whole note in the DOM even while clamped", () => {
    // The clamp is visual. Dropping the text would take it away from find-in-page
    // and from screen readers, which is a different bug from the one being fixed.
    stubOverflow({ overflowing: true });
    render(<ClampedNote label="Reason" text={LONG} tone="danger" />);

    expect(screen.getByText(LONG)).toBeTruthy();
    expect(screen.getByText(/Reason/)).toBeTruthy();
  });

  it("lets a long unbroken note wrap", () => {
    stubOverflow({ overflowing: true });
    render(<ClampedNote label="Reason" text={LONG} tone="danger" />);

    expect(screen.getByText(LONG).className).toContain("break-words");
  });

  it("offers no toggle when the note already fits", () => {
    // Showing "Show more" on a fully visible note is worse than showing nothing.
    stubOverflow({ overflowing: false });
    render(
      <ClampedNote label="Reason" text="Address unverified" tone="danger" />,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers a toggle when it does not", () => {
    stubOverflow({ overflowing: true });
    render(<ClampedNote label="Reason" text={LONG} tone="danger" />);

    expect(screen.getByRole("button", { name: /show more/i })).toBeTruthy();
  });

  it("expands and collapses, tracking aria-expanded", () => {
    stubOverflow({ overflowing: true });
    render(<ClampedNote label="Reason" text={LONG} tone="danger" />);

    const toggle = () => screen.getByRole("button");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /show less/i })).toBeTruthy();

    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("drops the clamp styles once expanded", () => {
    stubOverflow({ overflowing: true });
    render(<ClampedNote label="Reason" text={LONG} tone="danger" />);

    expect(screen.getByText(LONG).style.webkitLineClamp).toBe("1");

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText(LONG).style.webkitLineClamp).toBe("");
  });

  it("does not let expanding also trigger the card it sits in", () => {
    // On the seller side these live inside a clickable card that navigates.
    stubOverflow({ overflowing: true });
    const onCardClick = vi.fn();

    render(
      <div onClick={onCardClick}>
        <ClampedNote label="Reason" text={LONG} tone="danger" />
      </div>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
