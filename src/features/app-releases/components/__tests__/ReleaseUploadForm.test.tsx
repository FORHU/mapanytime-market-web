import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReleaseUploadForm } from "../ReleaseUploadForm";
import * as client from "@/features/app-releases/api/app-release.client";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderForm(hasDownloadable = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReleaseUploadForm
        nextBuildNumber={4}
        hasDownloadable={hasDownloadable}
      />
    </QueryClientProvider>,
  );
}

const apk = () =>
  new File(["apk"], "app-release.apk", {
    type: "application/vnd.android.package-archive",
  });

describe("ReleaseUploadForm", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("pre-fills the next build number", () => {
    renderForm();
    expect(screen.getByLabelText("Build number")).toHaveValue(4);
  });

  it("refuses a non-APK file before any upload starts", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const requestUploadUrl = vi.spyOn(client, "requestUploadUrl");
    renderForm();

    await user.upload(
      screen.getByLabelText("APK file"),
      new File(["x"], "notes.pdf", { type: "application/pdf" }),
    );
    await user.type(screen.getByLabelText("Version"), "1.2.0");
    await user.type(screen.getByLabelText(/What's new/), "Fixes");
    await user.click(screen.getByRole("button", { name: /Upload version/ }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Only .apk files can be uploaded.",
    );
    expect(requestUploadUrl).not.toHaveBeenCalled();
  });

  it("requires a valid version number", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.upload(screen.getByLabelText("APK file"), apk());
    await user.type(screen.getByLabelText("Version"), "v1");
    await user.type(screen.getByLabelText(/What's new/), "Fixes");
    await user.click(screen.getByRole("button", { name: /Upload version/ }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a version like 1.0.1.",
    );
  });

  it("defaults to making the first upload downloadable, but not later ones", () => {
    const { unmount } = renderForm(false);
    expect(
      screen.getByRole("checkbox", {
        name: /Make this the downloadable version/,
      }),
    ).toBeChecked();
    unmount();

    renderForm(true);
    expect(
      screen.getByRole("checkbox", {
        name: /Make this the downloadable version/,
      }),
    ).not.toBeChecked();
  });
});
