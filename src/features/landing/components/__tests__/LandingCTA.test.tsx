import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LandingCTA } from "../LandingCTA";

const release = {
  version: "1.0.0",
  minAndroidVersion: "Android 8.0+",
  fileSize: "115.9 MB",
};
const INSTALL_LINK = "http://localhost:4002/api/v1/app/download";

describe("LandingCTA", () => {
  it("makes Install the App a direct download of the selected version", () => {
    render(
      <LandingCTA
        downloadUrl={INSTALL_LINK}
        release={release}
        onShowDetails={() => {}}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Install the App/ }),
    ).toHaveAttribute("href", INSTALL_LINK);
    expect(
      screen.getByTitle("QR code to download the MapAnytime Android app"),
    ).toBeInTheDocument();
    expect(screen.getByText("Android 8.0+")).toBeInTheDocument();
  });

  it("opens the details dialog from Version details", async () => {
    const user = userEvent.setup();
    const onShowDetails = vi.fn();
    render(
      <LandingCTA
        downloadUrl={INSTALL_LINK}
        release={release}
        onShowDetails={onShowDetails}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Version details" }));

    expect(onShowDetails).toHaveBeenCalledTimes(1);
  });

  it("links nothing and explains where the download will appear when none is selected", async () => {
    const user = userEvent.setup();
    const onShowDetails = vi.fn();
    render(
      <LandingCTA
        downloadUrl={null}
        release={null}
        onShowDetails={onShowDetails}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /Install the App/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("QR code to download the MapAnytime Android app"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("The download will appear here once it's published."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Install the App/ }));
    expect(onShowDetails).toHaveBeenCalledTimes(1);
  });
});
