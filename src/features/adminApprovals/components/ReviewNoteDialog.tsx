"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, PencilLine } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { ApprovalItem } from "../contracts/approval.contract";

export type ReviewIntent = "reject" | "revise";

interface ReviewNoteDialogProps {
  item: ApprovalItem;
  intent: ReviewIntent;
  /** Lets the warning offer the revision path without closing the dialog. */
  onIntentChange: (intent: ReviewIntent) => void;
  isPending: boolean;
  onSubmit: (note: string) => void;
  onCancel: () => void;
}

const MIN_NOTE = 3;
/** Mirrors the API's Joi cap on both `reason` and `notes`. */
const MAX_NOTE = 1000;
/** How close to the cap before the counter starts warning. */
const COUNTER_WARN_AT = MAX_NOTE - 50;

/**
 * The one dialog behind both "Reject" and "Request changes".
 *
 * They share a shape — a note the seller reads, then a decision — but not a
 * weight. Rejection is the only outcome in the queue the seller cannot answer:
 * the API's edit lock refuses a REJECTED store and the transition matrix gives
 * them no way back, so only an administrator can reopen one. That asymmetry is
 * what the extra warning and acknowledgement here are for.
 *
 * The warning does more than caution. It offers the alternative in place,
 * because telling a reviewer "a revision might be better" and then making them
 * close this, find the row again and click a different button is friction that
 * buys nothing — they would just push on through the rejection.
 */
export function ReviewNoteDialog({
  item,
  intent,
  onIntentChange,
  isPending,
  onSubmit,
  onCancel,
}: ReviewNoteDialogProps) {
  const [note, setNote] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  // Drives the enter transition. useEffect rather than @starting-style so this
  // works in every browser the admin console has to support.
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReject = intent === "reject";

  useEffect(() => {
    setMounted(true);
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    // Escape is the key every reviewer tries. A backdrop click deliberately
    // does not close — a stray click outside would discard a half-written
    // reason, which the ConfirmDialog this borrows from never has to protect.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onCancel]);

  /**
   * Switching modes clears the acknowledgement.
   *
   * Without this, ticking the box, flipping to Request changes and flipping
   * back would leave the gate open with the reviewer having agreed to nothing —
   * the guard would still be drawn but no longer guarding.
   */
  const switchIntent = (next: ReviewIntent) => {
    setAcknowledged(false);
    onIntentChange(next);
  };

  const trimmed = note.trim();
  const canSubmit =
    trimmed.length >= MIN_NOTE && (!isReject || acknowledged) && !isPending;

  const copy = isReject
    ? {
        title: `Reject ${item.name}`,
        hint: "This decision is sent to the seller as written.",
        placeholder: "Why this store cannot be approved…",
        cta: isPending ? "Rejecting…" : "Reject store",
      }
    : {
        title: `Request changes to ${item.name}`,
        hint: "List what the seller needs to fix. They can edit the store and resubmit without starting over.",
        placeholder: "e.g. The mayor's permit scan is unreadable…",
        cta: isPending ? "Sending…" : "Send back to seller",
      };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-150 ease-out ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-note-title"
        aria-describedby="review-note-hint"
        // Centre origin is right here: a modal is not anchored to the button
        // that opened it, so scaling from the trigger would read as arbitrary.
        className={`w-full max-w-md origin-center rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-6 shadow-2xl transition-[opacity,transform] duration-200 motion-reduce:transition-opacity ${
          mounted ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <h2
          id="review-note-title"
          className="text-lg font-black text-[var(--text-primary)]"
        >
          {copy.title}
        </h2>

        {isReject && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 transition-opacity duration-150 ease-out">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  Rejection is final for the seller
                </p>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  They cannot edit or resubmit this store, only an administrator
                  can reopen it. Check the store against your criteria first: if
                  something specific needs fixing, ask for changes instead.
                </p>
                <button
                  type="button"
                  onClick={() => switchIntent("revise")}
                  className="inline-flex items-center gap-1.5 rounded-md text-xs font-bold text-[var(--brand-core)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-core)]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Request changes instead
                </button>
              </div>
            </div>
          </div>
        )}

        <p
          id="review-note-hint"
          className="mt-4 text-xs text-[var(--text-secondary)]"
        >
          {copy.hint}
        </p>

        <textarea
          ref={textareaRef}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={copy.placeholder}
          rows={4}
          // Capped here so the limit is discovered while typing rather than as
          // a 400 that discards everything the reviewer wrote.
          maxLength={MAX_NOTE}
          className="mt-2 w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--background-primary)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-core)]"
        />

        <p
          aria-live="polite"
          className={`mt-1 text-right text-[11px] tabular-nums ${
            note.length >= COUNTER_WARN_AT
              ? "text-amber-500"
              : "text-[var(--text-tertiary)]"
          }`}
        >
          {note.length} / {MAX_NOTE}
        </p>

        {isReject ? (
          // Deliberately not a <label> wrapper. Wrapping made the sentence — and
          // the whole row beside it — a click target, so a reviewer aiming near
          // the text agreed that a rejection is final without meaning to. On the
          // one irreversible control in this dialog the box is the only hit
          // area. `aria-labelledby` keeps the accessible name that the removed
          // <label> was providing.
          <div className="mt-4 flex items-start gap-2.5 text-xs font-medium text-[var(--text-secondary)]">
            <input
              type="checkbox"
              aria-labelledby="reject-acknowledgement"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-core)]"
            />
            <span id="reject-acknowledgement">
              I&apos;ve reviewed this store and it can&apos;t be fixed with a
              revision
            </span>
          </div>
        ) : (
          // The way back, deliberately quieter than the link that brought them
          // here: a reviewer who changed their mind should not have to lose
          // what they typed, but the dialog has no business nudging anyone
          // toward the destructive option. Returning re-arms the full warning
          // and an unticked acknowledgement.
          <button
            type="button"
            onClick={() => switchIntent("reject")}
            className="mt-4 rounded-md text-xs font-medium text-[var(--text-tertiary)] underline-offset-2 hover:text-[var(--text-secondary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-core)]"
          >
            Reject this store instead
          </button>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => canSubmit && onSubmit(trimmed)}
            // The destructive action should not wear the same fill as the
            // ordinary one beside it.
            style={isReject ? { backgroundColor: "#E8567D" } : undefined}
          >
            {copy.cta}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
