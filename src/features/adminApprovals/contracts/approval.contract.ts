import { z } from "zod";

/**
 * The statuses the admin queue can show, across both entity types.
 *
 * `DRAFT` only ever comes from a property the seller has not submitted yet —
 * stores have no draft state. It used to be reported as PENDING, which put
 * unsubmitted listings in the review queue looking exactly like ones actually
 * waiting on an admin.
 */
export const APPROVAL_STATUSES = [
  "DRAFT",
  "PENDING",
  "UNDER_REVIEW",
  "NEEDS_REVISION",
  "ACTIVE",
  "REJECTED",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/**
 * Parsed as an open string, then narrowed.
 *
 * A `z.enum` here throws the moment the API learns a status this build has not
 * heard of, and because the whole list is parsed at once that takes the entire
 * admin queue down rather than mislabelling one row. The server owns this
 * vocabulary; a second opinion in the client can only ever be wrong in a new
 * way.
 */
export const ApprovalStatusSchema = z
  .string()
  .transform((value): ApprovalStatus =>
    (APPROVAL_STATUSES as readonly string[]).includes(value)
      ? (value as ApprovalStatus)
      : "PENDING",
  );

/** Who is currently reviewing an item, when anyone is. */
export const ApprovalClaimSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ApprovalItemSchema = z.object({
  id: z.string(),
  entityType: z.enum(["STORE", "PROPERTY"]),
  name: z.string(),
  owner: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  propertyType: z.string().nullable().optional(),
  status: ApprovalStatusSchema,
  rejectionReason: z.string().nullable().optional(),
  revisionNotes: z.string().nullable().optional(),
  // Null when nobody holds the item, and also when the claim has gone stale —
  // the server releases an abandoned claim at read time rather than on a timer.
  claimedBy: ApprovalClaimSchema.nullable().optional().default(null),
  claimedAt: z.string().nullable().optional().default(null),
  // Ordering key: the most recent submission, so a store that has been through
  // a revision round takes its new place in the queue.
  submittedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const ApprovalsResponseSchema = z.array(ApprovalItemSchema);

/** One entry in a store's review timeline, read from the audit log. */
export const ApprovalHistoryEntrySchema = z.object({
  id: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  note: z.string().nullable(),
  actorId: z.string().nullable(),
  actorName: z.string().nullable(),
  createdAt: z.string(),
});

export const ApprovalHistoryResponseSchema = z.array(
  ApprovalHistoryEntrySchema,
);

export type ApprovalItem = z.infer<typeof ApprovalItemSchema>;
export type ApprovalHistoryEntry = z.infer<typeof ApprovalHistoryEntrySchema>;
