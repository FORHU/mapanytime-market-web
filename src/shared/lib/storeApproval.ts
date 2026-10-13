import {
  Clock,
  Eye,
  PencilLine,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export const STORE_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "NEEDS_REVISION",
  "ACTIVE",
  "REJECTED",
] as const;

export type StoreApprovalStatus = (typeof STORE_STATUSES)[number];

/**
 * Resolve a store's status for display and routing.
 *
 * Legacy rows predate `approvalStatus` entirely and carry only `isActive`;
 * treating those as PENDING would lock a seller out of a store that has been
 * trading for months. An unrecognised value from a newer API is reported as
 * PENDING too — the conservative direction, since it withholds an affordance
 * rather than granting one.
 */
export function normalizeStoreStatus(
  status: string | null | undefined,
  isActive?: boolean,
): StoreApprovalStatus {
  if (status && (STORE_STATUSES as readonly string[]).includes(status)) {
    return status as StoreApprovalStatus;
  }
  if (!status) return isActive ? "ACTIVE" : "PENDING";
  return "PENDING";
}

/** Statuses in which the seller may edit the store. Mirrors the API's lock. */
export function isStoreEditable(status: StoreApprovalStatus): boolean {
  return status === "NEEDS_REVISION" || status === "ACTIVE";
}

/**
 * Whether the seller can open the store at all.
 *
 * NEEDS_REVISION is deliberately included: the seller has been asked to fix
 * something, so refusing them entry would make the request impossible to act
 * on. They land on the edit form rather than the dashboard — see
 * `storeEntryRoute`.
 */
export function canOpenStore(status: StoreApprovalStatus): boolean {
  return status === "ACTIVE" || status === "NEEDS_REVISION";
}

/** The seller is waiting on an administrator and has nothing to do. */
export function isAwaitingReview(status: StoreApprovalStatus): boolean {
  return status === "PENDING" || status === "UNDER_REVIEW";
}

/** The store is back with the seller, with a list of changes to make. */
export function needsSellerAction(status: StoreApprovalStatus): boolean {
  return status === "NEEDS_REVISION";
}

/**
 * Where opening a store from the store list should land.
 *
 * Both routes read the active store from context rather than the URL, so the
 * caller must set `active_store_context_id` before navigating either way.
 *
 * A store with changes requested goes straight to the profile editor: it has no
 * orders or analytics to show yet, and the seller opened it to fix something.
 */
export function storeEntryRoute(status: StoreApprovalStatus): string | null {
  if (status === "NEEDS_REVISION") return "/seller/store-profile";
  if (status === "ACTIVE") return "/seller/dashboard";
  return null;
}

/** Why a store cannot be opened, phrased for the seller. */
export function storeBlockedReason(status: StoreApprovalStatus): string {
  switch (status) {
    case "PENDING":
      return "This store is waiting to be reviewed by an administrator.";
    case "UNDER_REVIEW":
      return "An administrator is reviewing this store right now.";
    case "REJECTED":
      return "This store's application was not approved.";
    default:
      return "This store is not available yet.";
  }
}

export interface StoreStatusPresentation {
  label: string;
  /** Tailwind classes for the badge, light and dark. */
  className: string;
  /**
   * Carried here rather than chosen at each call site so every status gets one.
   * The badge used to draw an icon for ACTIVE alone, which made the approved
   * state look like the only real one and left the other four as bare text.
   */
  Icon: LucideIcon;
  /**
   * What happens next, from the seller's side — the store card's footer line.
   *
   * One per status for the same reason as the icon: the footer used to collapse
   * PENDING, UNDER_REVIEW and REJECTED into a single "awaiting review", which
   * told a seller whose store was actively being read the same thing as one
   * sitting untouched in the queue, and told a rejected seller they were
   * waiting for something that was never coming.
   */
  nextStep: string;
}

/**
 * How each status reads to the seller.
 *
 * PENDING and UNDER_REVIEW share the "nothing has gone wrong, wait" amber;
 * NEEDS_REVISION gets its own orange because it is the only one asking for
 * something back.
 *
 * The icons match the admin queue's, so a status looks the same to the person
 * who set it and the person who receives it: a clock for queued, an eye for
 * being looked at, a pencil for "your turn".
 */
export const STORE_STATUS_PRESENTATION: Record<
  StoreApprovalStatus,
  StoreStatusPresentation
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Icon: Clock,
    nextStep: "Waiting for an administrator to pick this up",
  },
  UNDER_REVIEW: {
    label: "Under review",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    Icon: Eye,
    nextStep: "An administrator is reviewing this store",
  },
  NEEDS_REVISION: {
    label: "Changes requested",
    className:
      "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    Icon: PencilLine,
    nextStep: "Fix and resubmit",
  },
  ACTIVE: {
    // ShieldCheck rather than the admin's plain tick: to the seller this badge
    // says "verified", which is the thing they were waiting for.
    label: "Active",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Icon: ShieldCheck,
    nextStep: "Initialize Management Node",
  },
  REJECTED: {
    label: "Not approved",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    Icon: XCircle,
    // Not "awaiting review": rejection is terminal for the seller. Only an
    // administrator can reopen one, so support is the honest route.
    nextStep: "Contact support to appeal",
  },
};
