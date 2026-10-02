import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useUploadRelease } from "@/features/app-releases/hooks";
import * as client from "@/features/app-releases/api/app-release.client";
import * as apkFile from "@/features/app-releases/lib/apkFile";
import type { AdminRelease } from "@/features/app-releases/contracts/app-release.contract";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const file = new File(["apk-bytes"], "app-release.apk", {
  type: "application/vnd.android.package-archive",
});

const input = {
  file,
  version: "1.2.0",
  buildNumber: 3,
  channel: "Stable" as const,
  minAndroidVersion: "Android 8.0+",
  architecture: "arm64-v8a",
  whatsNew: ["Faster map"],
  makeDownloadable: true,
};

describe("useUploadRelease", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("hashes, uploads straight to S3, then records the release with the S3 key", async () => {
    vi.spyOn(apkFile, "sha256Hex").mockResolvedValue("a".repeat(64));
    vi.spyOn(client, "requestUploadUrl").mockResolvedValue({
      uploadUrl:
        "https://bucket.s3.amazonaws.com/apks/v1.2.0/abc/app-release.apk?sig",
      s3Key: "apks/v1.2.0/abc/app-release.apk",
      contentType: "application/vnd.android.package-archive",
      expiresIn: 1800,
    });
    const upload = vi
      .spyOn(client, "uploadApkToStorage")
      .mockImplementation(async (_f, _u, _t, onProgress) => {
        onProgress(0.5);
        onProgress(1);
      });
    const create = vi.spyOn(client, "createRelease").mockResolvedValue({
      version: "1.2.0",
      isDownloadable: true,
    } as AdminRelease);

    const { result } = renderHook(() => useUploadRelease(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    expect(client.requestUploadUrl).toHaveBeenCalledWith({
      version: "1.2.0",
      fileName: "app-release.apk",
      fileSizeBytes: file.size,
    });
    expect(upload).toHaveBeenCalledWith(
      file,
      expect.stringContaining("apks/v1.2.0"),
      "application/vnd.android.package-archive",
      expect.any(Function),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        s3Key: "apks/v1.2.0/abc/app-release.apk",
        fileSizeBytes: file.size,
        sha256: "a".repeat(64),
        makeDownloadable: true,
      }),
    );
    await waitFor(() => expect(result.current.stage).toBe("done"));
    expect(result.current.progress).toBe(1);
  });

  it("never records a release when the upload to S3 fails", async () => {
    vi.spyOn(apkFile, "sha256Hex").mockResolvedValue(undefined);
    vi.spyOn(client, "requestUploadUrl").mockResolvedValue({
      uploadUrl: "https://bucket/put",
      s3Key: "apks/v1.2.0/abc/app-release.apk",
      contentType: "application/vnd.android.package-archive",
      expiresIn: 1800,
    });
    vi.spyOn(client, "uploadApkToStorage").mockRejectedValue(
      new Error("Upload to storage failed (HTTP 403)."),
    );
    const create = vi.spyOn(client, "createRelease");

    const { result } = renderHook(() => useUploadRelease(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(input).catch(() => {});
    });

    expect(create).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.stage).toBe("idle"));
  });
});
