/* eslint-disable @next/next/no-img-element -- next/image is stubbed with a plain img in tests */
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { LandingHowItWorks } from "../LandingHowItWorks";
import { HOW_STEPS } from "@/features/landing/landing.content";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

describe("LandingHowItWorks", () => {
  beforeEach(() => {
    // jsdom has no canvas; the pickup pass code simply stays blank.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts the story on Find, with no step rail", () => {
    render(<LandingHowItWorks />);

    expect(
      screen.queryByRole("navigation", { name: "How MapAnytime works" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Find a store near you." })
        .parentElement,
    ).toHaveClass("is-on");
  });

  it("keeps every scene's heading and text readable, not just the one on screen", () => {
    render(<LandingHowItWorks />);

    for (const step of HOW_STEPS) {
      expect(
        screen.getByRole("heading", { name: step.heading }),
      ).toBeInTheDocument();
      expect(screen.getByText(step.body)).toBeInTheDocument();
    }
  });

  it("hides the animated world from assistive tech", () => {
    const { container } = render(<LandingHowItWorks />);

    expect(container.querySelector(".lp-world")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("adds up the example order across both stores", () => {
    const { container } = render(<LandingHowItWorks />);

    const sheet = container.querySelector(".lp-sheet") as HTMLElement;
    expect(within(sheet).getByText("2 stores, 4 items")).toBeInTheDocument();
    expect(within(sheet).getByText("₱715")).toBeInTheDocument();
  });

  it("ends on the story itself, with no closing call to action", () => {
    render(<LandingHowItWorks />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
