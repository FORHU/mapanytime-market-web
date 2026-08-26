import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PromotionForm } from "../PromotionForm";
import * as promotionsClient from "@/features/promotions/api/promotions.client";
import type {
  Promotion,
  PromotionBadge,
} from "@/features/promotions/contracts/promotions.contract";

vi.mock("@/features/promotions/api/promotions.client");

const BADGES: PromotionBadge[] = [
  {
    id: "badge-hot",
    slug: "HOT",
    label: "Hot",
    description: "Trending",
    position: 0,
    isActive: true,
  },
  {
    id: "badge-sale",
    slug: "SALE_NOW",
    label: "Sale Now",
    description: "Active price drop",
    position: 1,
    isActive: true,
  },
];

function NoopMap() {
  return null;
}

function renderForm(promotion?: Promotion) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const onDone = vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <PromotionForm
        storeId="store-1"
        promotion={promotion}
        onDone={onDone}
        MapSelectionComponent={NoopMap}
      />
    </QueryClientProvider>,
  );

  return { onDone };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText(/buy 1 take 1/i), "Weekend deal");
  await user.type(
    screen.getByPlaceholderText(/tell customers/i),
    "20% off everything",
  );
}

describe("PromotionForm badge selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(promotionsClient.listPromotionBadges).mockResolvedValue(BADGES);
    vi.mocked(promotionsClient.createPromotion).mockResolvedValue(
      {} as Promotion,
    );
  });

  it("submits the selected preset badgeId with no custom label", async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByRole("option", { name: "Hot" });
    await fillRequiredFields(user);
    await user.selectOptions(screen.getByLabelText("Badge label"), "badge-hot");
    await user.click(screen.getByRole("button", { name: /create promotion/i }));

    await waitFor(() =>
      expect(promotionsClient.createPromotion).toHaveBeenCalled(),
    );
    const payload = vi.mocked(promotionsClient.createPromotion).mock
      .calls[0][0];
    expect(payload.badgeId).toBe("badge-hot");
    expect(payload.badgeLabel).toBeNull();
  });

  it("reveals a text input for 'Others…' and submits the typed label with badgeId null", async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByRole("option", { name: "Hot" });
    await fillRequiredFields(user);
    await user.selectOptions(
      screen.getByLabelText("Badge label"),
      "__custom__",
    );

    const customInput = screen.getByPlaceholderText(/weekend special/i);
    await user.type(customInput, "My Custom Badge");
    await user.click(screen.getByRole("button", { name: /create promotion/i }));

    await waitFor(() =>
      expect(promotionsClient.createPromotion).toHaveBeenCalled(),
    );
    const payload = vi.mocked(promotionsClient.createPromotion).mock
      .calls[0][0];
    expect(payload.badgeId).toBeNull();
    expect(payload.badgeLabel).toBe("My Custom Badge");
  });

  it("blocks submission when 'Others…' is picked but left blank", async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByRole("option", { name: "Hot" });
    await fillRequiredFields(user);
    await user.selectOptions(
      screen.getByLabelText("Badge label"),
      "__custom__",
    );
    await user.click(screen.getByRole("button", { name: /create promotion/i }));

    expect(
      await screen.findByText("Enter a badge name, or pick one from the list."),
    ).toBeInTheDocument();
    expect(promotionsClient.createPromotion).not.toHaveBeenCalled();
  });

  it("sends both fields as null when no badge is selected", async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByRole("option", { name: "Hot" });
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /create promotion/i }));

    await waitFor(() =>
      expect(promotionsClient.createPromotion).toHaveBeenCalled(),
    );
    const payload = vi.mocked(promotionsClient.createPromotion).mock
      .calls[0][0];
    expect(payload.badgeId).toBeNull();
    expect(payload.badgeLabel).toBeNull();
  });

  it("preselects the matching preset when editing a promotion with a badgeId", async () => {
    renderForm({
      id: "promo-1",
      storeId: "store-1",
      kind: "PROMO",
      title: "t",
      description: "d",
      badgeId: "badge-sale",
      badgeLabel: "Sale Now",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    } as Promotion);

    await screen.findByRole("option", { name: "Hot" });
    expect(screen.getByLabelText("Badge label")).toHaveValue("badge-sale");
  });

  it("preselects 'Others…' with the saved text when editing a custom label", async () => {
    renderForm({
      id: "promo-2",
      storeId: "store-1",
      kind: "PROMO",
      title: "t",
      description: "d",
      badgeId: null,
      badgeLabel: "Grand Opening",
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    } as Promotion);

    await screen.findByRole("option", { name: "Hot" });
    expect(screen.getByLabelText("Badge label")).toHaveValue("__custom__");
    expect(screen.getByPlaceholderText(/weekend special/i)).toHaveValue(
      "Grand Opening",
    );
  });
});
