import { describe, it, expect } from "vitest";
import {
  STORE_STATUSES,
  STORE_STATUS_PRESENTATION,
  canOpenStore,
  isAwaitingReview,
  isStoreEditable,
  needsSellerAction,
  normalizeStoreStatus,
  storeEntryRoute,
} from "@/shared/lib/storeApproval";
import { StoreSchema } from "@/features/stores/contracts/manage-stores.contract";
import {
  ApprovalItemSchema,
  APPROVAL_STATUSES,
} from "@/features/adminApprovals/contracts/approval.contract";

/**
 * The contracts are typed as open strings on purpose.
 *
 * A `z.enum` throws on a value it has not heard of, and because these lists are
 * parsed whole that takes the entire store list or admin queue down rather than
 * mislabelling one row. Since the API can ship a new status before the web
 * does, the parse has to survive it — that is what these first cases pin.
 */

describe("status parsing survives the server moving first", () => {
  const baseStore = {
    id: "s1",
    storeName: "Test",
    description: null,
    isActive: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  it.each(STORE_STATUSES)("parses %s", (status) => {
    expect(() =>
      StoreSchema.parse({ ...baseStore, approvalStatus: status }),
    ).not.toThrow();
  });

  it("parses a status this build has never heard of", () => {
    expect(() =>
      StoreSchema.parse({ ...baseStore, approvalStatus: "ESCALATED_TO_LEGAL" }),
    ).not.toThrow();
  });

  it("parses a row that predates the column entirely", () => {
    expect(() => StoreSchema.parse(baseStore)).not.toThrow();
  });

  const baseApproval = {
    id: "a1",
    entityType: "STORE",
    name: "Test",
    owner: "Owner",
    email: "o@example.com",
    address: "Somewhere",
    createdAt: "2026-01-01",
  };

  it.each(APPROVAL_STATUSES)("parses %s in the admin queue", (status) => {
    expect(() =>
      ApprovalItemSchema.parse({ ...baseApproval, status }),
    ).not.toThrow();
  });

  it("falls back rather than throwing on an unknown admin status", () => {
    const parsed = ApprovalItemSchema.parse({
      ...baseApproval,
      status: "SOMETHING_NEW",
    });

    expect(parsed.status).toBe("PENDING");
  });
});

describe("normalizeStoreStatus", () => {
  it.each(STORE_STATUSES)("passes %s through", (status) => {
    expect(normalizeStoreStatus(status)).toBe(status);
  });

  it("reads a legacy live store as ACTIVE", () => {
    // These rows have no approvalStatus at all. Calling them PENDING would lock
    // a seller out of a store that has been trading for months.
    expect(normalizeStoreStatus(undefined, true)).toBe("ACTIVE");
  });

  it("reads a legacy inactive store as PENDING", () => {
    expect(normalizeStoreStatus(undefined, false)).toBe("PENDING");
  });

  it("withholds rather than grants on an unrecognised value", () => {
    expect(normalizeStoreStatus("ESCALATED_TO_LEGAL", true)).toBe("PENDING");
  });
});

describe("what each status permits", () => {
  it("unlocks edits exactly where the API does", () => {
    // Mirrors EDITABLE_STATUSES in storeApproval.service.ts. If one side moves,
    // the seller gets a form that saves into a 409.
    expect(STORE_STATUSES.filter(isStoreEditable)).toEqual([
      "NEEDS_REVISION",
      "ACTIVE",
    ]);
  });

  it("lets the seller in only where there is something to do or see", () => {
    expect(STORE_STATUSES.filter(canOpenStore)).toEqual([
      "NEEDS_REVISION",
      "ACTIVE",
    ]);
  });

  it("treats both waiting states as waiting", () => {
    expect(STORE_STATUSES.filter(isAwaitingReview)).toEqual([
      "PENDING",
      "UNDER_REVIEW",
    ]);
  });

  it("asks the seller for something in exactly one state", () => {
    expect(STORE_STATUSES.filter(needsSellerAction)).toEqual([
      "NEEDS_REVISION",
    ]);
  });
});

describe("storeEntryRoute", () => {
  it("sends a store with changes requested to the editor, not the dashboard", () => {
    // There are no orders or analytics to look at yet, and the seller opened it
    // to fix something.
    expect(storeEntryRoute("NEEDS_REVISION")).toBe("/seller/store-profile");
  });

  it("sends an approved store to the dashboard", () => {
    expect(storeEntryRoute("ACTIVE")).toBe("/seller/dashboard");
  });

  it.each(["PENDING", "UNDER_REVIEW", "REJECTED"] as const)(
    "offers nowhere to go from %s",
    (status) => {
      expect(storeEntryRoute(status)).toBeNull();
    },
  );
});

describe("presentation", () => {
  it("covers every status, so no badge can render blank", () => {
    for (const status of STORE_STATUSES) {
      expect(STORE_STATUS_PRESENTATION[status]?.label).toBeTruthy();
      expect(STORE_STATUS_PRESENTATION[status]?.className).toBeTruthy();
    }
  });

  it("gives every status an icon, not just the approved one", () => {
    // The badge used to draw an icon for ACTIVE alone, which left the other
    // four as bare text and made approval look like the only real state.
    // Only presence is checked here — lucide icons are forwardRef objects
    // rather than plain functions, and that they actually render is covered by
    // StoreManagementDashboard.status.test.tsx.
    for (const status of STORE_STATUSES) {
      expect(STORE_STATUS_PRESENTATION[status]?.Icon).toBeDefined();
    }
  });

  it("does not label the two waiting states identically", () => {
    expect(STORE_STATUS_PRESENTATION.PENDING.label).not.toBe(
      STORE_STATUS_PRESENTATION.UNDER_REVIEW.label,
    );
  });

  it("gives every status its own next step", () => {
    // These used to collapse: PENDING, UNDER_REVIEW and REJECTED all read
    // "awaiting administrator review", so the seller could not tell a store
    // being actively read from one nobody had opened — or from one that was
    // never coming back.
    const steps = STORE_STATUSES.map(
      (status) => STORE_STATUS_PRESENTATION[status].nextStep,
    );

    expect(new Set(steps).size).toBe(STORE_STATUSES.length);
    steps.forEach((step) => expect(step).toBeTruthy());
  });
});
