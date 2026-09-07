import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MembersPanel } from "@/features/team/components/MembersPanel";
import * as teamClient from "@/features/team/api/team.client";
import type {
  OrgMember,
  OrgStore,
} from "@/features/team/contracts/team.contract";
import { CATALOGUE } from "@/features/team/testing/catalogue.fixture";

vi.mock("@/features/team/api/team.client");

/**
 * Regression cover for the edit-member save path.
 *
 * The bug: MembersPanel rebuilt the mutation payload field by field
 * (`{ role: input.role, storeIds: input.storeIds }`), so `permissions` was
 * silently dropped on its way from the modal to the request. Every field on
 * that input is optional, so nothing type-checked, the request succeeded, and
 * the server wrote no change — the checkbox simply reverted on reload.
 */

const MEMBER: OrgMember = {
  id: "member-1",
  userId: "user-2",
  role: "SELLER_MEMBER",
  user: {
    id: "user-2",
    email: "staff@example.com",
    firstName: "Rico",
    lastName: "Bautista",
  },
  assignedStores: [{ storeId: "store-1" }],
  permissions: ["orders.process", "products.view"],
  isOwner: false,
};

/**
 * The organization owner's row. The API refuses to edit or remove it for every
 * caller — including a SELLER_ADMIN the owner hired — so the panel must not
 * offer either action.
 */
const OWNER: OrgMember = {
  id: "member-owner",
  userId: "user-owner",
  role: "SELLER_ADMIN",
  user: {
    id: "user-owner",
    email: "owner@example.com",
    firstName: "Ana",
    lastName: "Cruz",
  },
  assignedStores: [],
  permissions: [],
  isOwner: true,
};

const STORES: OrgStore[] = [
  { id: "store-1", storeName: "Main branch", isActive: true },
];

function renderPanel(members: OrgMember[] = [MEMBER]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MembersPanel
        members={members}
        stores={STORES}
        catalogue={CATALOGUE}
        isAdmin
        currentUserId="user-1"
      />
    </QueryClientProvider>,
  );
}

/** Open the edit modal for the seeded member. */
async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /edit rico/i }));
  await screen.findByText(/edit member/i);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(teamClient.updateMember).mockResolvedValue(MEMBER);
});

describe("MembersPanel permission editing", () => {
  it("sends the updated permission list when a box is ticked", async () => {
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(
      screen.getByRole("checkbox", { name: /promotions & ads/i }),
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [memberId, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(memberId).toBe("member-1");
    // Catalogue order, not click order.
    expect(input.permissions).toEqual([
      "orders.process",
      "products.view",
      "promotions.add",
    ]);
  });

  it("sends the reduced list when a box is unticked", async () => {
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(screen.getByRole("checkbox", { name: /process orders/i }));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input.permissions).toEqual(["products.view"]);
  });

  it("sends an explicit empty list when every box is unticked", async () => {
    // Revoking everything must reach the server as [], not as "omitted" — the
    // API treats undefined as "use the role default".
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(screen.getByRole("checkbox", { name: /process orders/i }));
    await user.click(
      screen.getByRole("checkbox", { name: /view products & stock/i }),
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input.permissions).toEqual([]);
  });

  it("still sends role and storeIds when nothing was edited", async () => {
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input).toMatchObject({
      role: "SELLER_MEMBER",
      storeIds: ["store-1"],
    });
  });
});

describe("saving without touching the permission grid", () => {
  it("omits permissions entirely so the server leaves them alone", async () => {
    // The data-loss bug. State was seeded from `sanitizePermissions`, which
    // drops codes this build does not know, and that reduced array was then
    // submitted as authoritative — so opening a member and pressing Save
    // destroyed every permission the web did not recognise. An untouched grid
    // must send nothing: the API treats an absent list as "leave it alone".
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input).not.toHaveProperty("permissions");
  });

  it("preserves codes the catalogue no longer defines", async () => {
    // The concrete loss: a member still carrying a retired code. Re-submitting
    // it is not an option either — the API 400s on codes outside its catalogue
    // — so the only safe answer is to send no list at all.
    const stale: OrgMember = {
      ...MEMBER,
      permissions: ["orders.process", "sales_review"],
    };
    const user = userEvent.setup();
    renderPanel([stale]);
    await openEditor(user);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input).not.toHaveProperty("permissions");
  });

  it("warns that retired codes exist rather than dropping them quietly", async () => {
    const stale: OrgMember = {
      ...MEMBER,
      permissions: ["orders.process", "sales_review"],
    };
    const user = userEvent.setup();
    renderPanel([stale]);
    await openEditor(user);

    expect(screen.getByText(/sales_review/)).toBeTruthy();
  });

  it("sends the list once a box is actually ticked", async () => {
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.click(
      screen.getByRole("checkbox", { name: /promotions & ads/i }),
    );
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input.permissions).toEqual([
      "orders.process",
      "products.view",
      "promotions.add",
    ]);
  });

  it("sends the role's defaults when only the role changed", async () => {
    // A role change rewrites permissions server-side regardless, so the client
    // showing and sending the new defaults matches what the API would do.
    const user = userEvent.setup();
    renderPanel();
    await openEditor(user);

    await user.selectOptions(screen.getByRole("combobox"), "SELLER_MANAGER");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(teamClient.updateMember).toHaveBeenCalled());

    const [, input] = vi.mocked(teamClient.updateMember).mock.calls[0];
    expect(input.role).toBe("SELLER_MANAGER");
    expect(input.permissions).toEqual([
      "orders.process",
      "products.view",
      "products.edit",
      "promotions.add",
    ]);
  });
});

describe("organization owner row", () => {
  it("offers no edit or remove action for the owner", async () => {
    // A SELLER_ADMIN viewing the team page is `isAdmin` here, which is exactly
    // the account that could previously remove the owner.
    renderPanel([OWNER]);

    expect(screen.queryByRole("button", { name: /edit ana/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /remove ana/i })).toBeNull();
  });

  it("labels the owner so the missing actions read as deliberate", () => {
    renderPanel([OWNER]);

    expect(screen.getByText(/^owner$/i)).toBeTruthy();
  });

  it("still offers both actions for ordinary staff in the same list", () => {
    // The owner rule must not disable staff management generally.
    renderPanel([OWNER, MEMBER]);

    expect(screen.getByRole("button", { name: /edit rico/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /remove rico/i })).toBeTruthy();
  });
});
