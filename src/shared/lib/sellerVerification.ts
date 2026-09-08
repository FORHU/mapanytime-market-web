/**
 * Whether a seller may use the seller tools yet.
 *
 * A seller registers with `applicationStatus = PENDING` and stays there until an
 * administrator approves them. Until that happens they can sign in — they are a
 * real user with a real account — but the seller features are closed to them.
 *
 * This lives in `shared/` rather than in `features/team` or `features/auth`
 * because both need it and neither may import the other: the org-context query
 * carries the status for an already-signed-in seller, while the login response
 * carries it for the post-login redirect. One predicate, so the two answers can
 * never disagree about what "restricted" means.
 *
 * None of this is enforcement. `requireApprovedSeller` on the API is the gate;
 * everything here just avoids offering a seller a door that would be slammed on
 * them.
 */

/** Where a restricted seller is sent, and the only seller route they may open. */
export const SELLER_PENDING_ROUTE = "/seller/pending";

/**
 * `null`/`undefined` is not "unverified" — it means the caller holds no seller
 * registration at all, which is the normal and permanent state for organization
 * staff. Treating it as restricted would show the under-review screen to every
 * hired member of a perfectly approved organization.
 *
 * It is also what an API predating this field sends, so the same branch fails
 * open rather than locking the shell over a version skew.
 */
export function isSellerRestricted(status: string | null | undefined): boolean {
  return Boolean(status) && status !== "APPROVED";
}

/**
 * Rejected is a distinct end state, not a longer wait. Kept separate so the
 * pending screen can say so instead of promising a review that already happened.
 */
export function isSellerRejected(status: string | null | undefined): boolean {
  return status === "REJECTED";
}
