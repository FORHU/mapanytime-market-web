/* eslint-disable @next/next/no-img-element -- next/image is stubbed with a plain img in tests */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LandingHowItWorks } from "../LandingHowItWorks";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

function panelFor(heading: string) {
  return screen.getByText(heading).closest(".lp-pt") as HTMLElement;
}

describe("LandingHowItWorks", () => {
  it("starts on Discover and switches steps when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<LandingHowItWorks />);

    expect(screen.getByRole("tab", { name: /Discover/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(panelFor("Find stores near you.")).toHaveClass("is-on");

    await user.click(screen.getByRole("tab", { name: /Shop/ }));

    expect(screen.getByRole("tab", { name: /Shop/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(panelFor("Add what you like to your cart.")).toHaveClass("is-on");
    expect(panelFor("Find stores near you.")).not.toHaveClass("is-on");
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<LandingHowItWorks />);

    screen.getByRole("tab", { name: /Discover/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Shop/ })).toHaveFocus();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: /Pick up/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens a store card when a map marker is tapped", async () => {
    const user = userEvent.setup();
    render(<LandingHowItWorks />);

    await user.click(
      screen.getByRole("button", { name: "Open Highland Greens" }),
    );

    expect(screen.getByText("Highland Greens")).toBeInTheDocument();
    expect(
      screen.getByText("Nice. That is the store card."),
    ).toBeInTheDocument();
  });

  it("adds to the cart, then marks the Shop step done", async () => {
    const user = userEvent.setup();
    render(<LandingHowItWorks />);

    await user.click(screen.getByRole("button", { name: "Next: Shop" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByLabelText("Cart, 2 items")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Added to cart" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("tab", { name: /Purchase/ }));
    expect(screen.getByRole("tab", { name: /Shop/ })).toHaveClass("is-done");
  });

  it("places the pickup order and shows Processing", async () => {
    const user = userEvent.setup();
    render(<LandingHowItWorks />);

    await user.click(screen.getByRole("tab", { name: /Purchase/ }));
    expect(screen.getByText("In cart")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Place pickup order" }),
    );

    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Order placed" })).toBeDisabled();
  });

  it("has nothing to click in the Pick up demo, and Start over resets", async () => {
    const user = userEvent.setup();
    const { container } = render(<LandingHowItWorks />);

    await user.click(screen.getByRole("tab", { name: /Shop/ }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    await user.click(screen.getByRole("tab", { name: /Pick up/ }));

    const pickup = container.querySelector(".lp-pv--pick") as HTMLElement;
    expect(within(pickup).queryAllByRole("button")).toHaveLength(0);
    expect(
      within(pickup).getByText("Your order is ready for pickup"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(screen.getByRole("tab", { name: /Discover/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: /Shop/ }));
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });
});
