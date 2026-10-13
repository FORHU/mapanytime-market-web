import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ReleaseList } from "../ReleaseList";
import * as client from "@/features/app-releases/api/app-release.client";
import type { AdminRelease } from "@/features/app-releases/contracts/app-release.contract";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function wrap(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const base: AdminRelease = {
  id: "rel-1",
  version: "1.0.0",
  buildNumber: 1,
  channel: "Stable",
  fileName: "app-release.apk",
  fileSize: "115.9 MB",
  fileSizeBytes: 121_530_000,
  minAndroidVersion: "Android 8.0+",
  architecture: "arm64-v8a",
  sha256: null,
  whatsNew: ["First"],
  forceUpdate: false,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
  s3Key: "apks/v1.0.0/abc/app-release.apk",
  apkUrl: null,
  status: "ACTIVE",
  isDownloadable: false,
  hasFile: true,
  uploadedById: "admin-1",
  uploadedBy: {
    id: "admin-1",
    firstName: "Rina",
    lastName: "Dela Cruz",
    email: "rina@example.com",
  },
};

const releases: AdminRelease[] = [
  {
    ...base,
    id: "rel-2",
    version: "1.1.0",
    buildNumber: 2,
    isDownloadable: true,
  },
  base,
  { ...base, id: "rel-0", version: "0.9.0", buildNumber: 0, status: "FAILED" },
];

describe("ReleaseList", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("marks exactly the downloadable version and only offers selection on the others", () => {
    wrap(<ReleaseList releases={releases} />);
    const items = screen.getAllByRole("listitem");

    expect(within(items[0]).getByText("Downloadable")).toBeInTheDocument();
    expect(
      within(items[0]).queryByRole("button", { name: /Make downloadable/ }),
    ).not.toBeInTheDocument();
    expect(
      within(items[1]).getByRole("button", { name: /Make downloadable/ }),
    ).toBeInTheDocument();
    // A broken build can never be selected again.
    expect(within(items[2]).getByText("Broken")).toBeInTheDocument();
    expect(
      within(items[2]).queryByRole("button", { name: /Make downloadable/ }),
    ).not.toBeInTheDocument();
    expect(within(items[1]).getByText(/by Rina Dela Cruz/)).toBeInTheDocument();
  });

  it("switches the downloadable version after confirmation", async () => {
    const user = userEvent.setup();
    const setDownloadable = vi
      .spyOn(client, "setDownloadableRelease")
      .mockResolvedValue({ ...base, isDownloadable: true });

    wrap(<ReleaseList releases={releases} />);
    const items = screen.getAllByRole("listitem");
    await user.click(
      within(items[1]).getByRole("button", { name: /Make downloadable/ }),
    );

    expect(setDownloadable).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Make downloadable",
      }),
    );

    expect(setDownloadable).toHaveBeenCalledWith("rel-1");
  });

  it("shows an empty state before anything is uploaded", () => {
    wrap(<ReleaseList releases={[]} />);
    expect(screen.getByText("No versions uploaded yet")).toBeInTheDocument();
  });
});
