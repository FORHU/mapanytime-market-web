import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useLatestRelease } from "@/features/app-releases/hooks";
import * as client from "@/features/app-releases/api/app-release.client";
import type { PublicRelease } from "@/features/app-releases/contracts/app-release.contract";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const release: PublicRelease = {
  id: "rel-1",
  version: "1.2.0",
  buildNumber: 3,
  channel: "Stable",
  fileName: "app-release.apk",
  fileSize: "115.9 MB",
  fileSizeBytes: 121_530_000,
  minAndroidVersion: "Android 8.0+",
  architecture: "arm64-v8a",
  sha256: null,
  whatsNew: ["Faster map"],
  forceUpdate: false,
  createdAt: "2026-10-01T00:00:00.000Z",
};

describe("useLatestRelease", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("exposes the stable install link once a version is downloadable", async () => {
    vi.spyOn(client, "fetchLatestRelease").mockResolvedValue({
      available: true,
      release,
    });

    const { result } = renderHook(() => useLatestRelease(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.available).toBe(true));
    expect(result.current.release?.version).toBe("1.2.0");
    // The link names no version or storage path; the API resolves it.
    expect(result.current.downloadUrl).toMatch(/\/api\/v1\/app\/download$/);
    expect(result.current.downloadUrl).not.toContain("1.2.0");
  });

  it("gives no link while nothing is downloadable", async () => {
    vi.spyOn(client, "fetchLatestRelease").mockResolvedValue({
      available: false,
      release: null,
    });

    const { result } = renderHook(() => useLatestRelease(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.available).toBe(false);
    expect(result.current.downloadUrl).toBeNull();
  });
});
