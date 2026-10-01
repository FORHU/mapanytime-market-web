import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LandingCTA } from "../LandingCTA";

const release = {
  version: "1.0.0",
  minAndroidVersion: "Android 8.0+",
  fileSize: "115.9 MB",
};

describe("LandingCTA", () => {
  it("renders a QR code when a release is published", () => {
    render(
      <LandingCTA
        {...release}
        downloadUrl="https://downloads.example.com/mapanytime.apk"
        onInstall={() => {}}
      />,
    );

    expect(
      screen.getByTitle("QR code to download the MapAnytime Android app"),
    ).toBeInTheDocument();
    expect(screen.getByText("Scan to download on Android")).toBeInTheDocument();
    expect(screen.getByText("Android 8.0+")).toBeInTheDocument();
  });

  it("explains where the download will appear when nothing is published", () => {
    render(<LandingCTA {...release} downloadUrl={null} onInstall={() => {}} />);

    expect(
      screen.queryByTitle("QR code to download the MapAnytime Android app"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("The download will appear here once it's published."),
    ).toBeInTheDocument();
  });

  it("opens the download dialog from the Install button", async () => {
    const user = userEvent.setup();
    const onInstall = vi.fn();
    render(
      <LandingCTA {...release} downloadUrl={null} onInstall={onInstall} />,
    );

    await user.click(screen.getByRole("button", { name: /Install the App/ }));

    expect(onInstall).toHaveBeenCalledTimes(1);
  });
});
