import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { ReviewNoteDialog, type ReviewIntent } from "../ReviewNoteDialog";
import type { ApprovalItem } from "@/features/adminApprovals/contracts/approval.contract";

/**
 * The guard on the one decision a seller cannot answer.
 *
 * Rejection leaves the store somewhere the seller has no route out of — the
 * API's edit lock refuses it and the transition matrix offers them nothing —
 * so this dialog asks the reviewer to say, explicitly, that a revision would
 * not have done instead.
 */

const item = {
  id: "store-1",
  entityType: "STORE",
  name: "Pets Shop",
  owner: "JZ RAWR",
  email: "sellerjr@example.com",
  address: "Otek St, Baguio",
  status: "UNDER_REVIEW",
  createdAt: "2026-01-01T00:00:00.000Z",
} as unknown as ApprovalItem;

const onSubmit = vi.fn();
const onCancel = vi.fn();

/** Mirrors the page: intent lives outside, so the dialog stays mounted. */
function Harness({ initial = "reject" as ReviewIntent }) {
  const [intent, setIntent] = useState<ReviewIntent>(initial);
  return (
    <ReviewNoteDialog
      item={item}
      intent={intent}
      onIntentChange={setIntent}
      isPending={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

const reasonBox = () => screen.getByRole("textbox");
const ack = () => screen.getByRole("checkbox");
const submit = (name: RegExp) => screen.getByRole("button", { name });
const rejectBtn = () => submit(/reject store/i);
const reviseBtn = () => submit(/send back to seller/i);

const type = (value: string) =>
  fireEvent.change(reasonBox(), { target: { value } });

beforeEach(() => vi.clearAllMocks());

describe("what each mode shows", () => {
  it("warns, and explains what rejection costs the seller", () => {
    render(<Harness />);

    expect(screen.getByText(/rejection is final for the seller/i)).toBeTruthy();
    // Accuracy matters here: an admin *can* reopen a rejected store, so the
    // copy must not claim the decision is permanent.
    expect(
      screen.getByText(/only an\s+administrator can reopen it/i),
    ).toBeTruthy();
    expect(ack()).toBeTruthy();
  });

  it("does not warn when only asking for changes", () => {
    render(<Harness initial="revise" />);

    expect(screen.queryByText(/rejection is final/i)).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});

describe("the acknowledgement gate", () => {
  it("refuses a reason with no acknowledgement", () => {
    render(<Harness />);
    type("Address could not be verified");

    expect(rejectBtn()).toBeDisabled();
  });

  it("refuses an acknowledgement with no reason", () => {
    render(<Harness />);
    fireEvent.click(ack());

    expect(rejectBtn()).toBeDisabled();
  });

  it("opens only when both are given", () => {
    render(<Harness />);
    type("Address could not be verified");
    fireEvent.click(ack());

    expect(rejectBtn()).not.toBeDisabled();
  });

  it("does not tick when the sentence beside the box is clicked", () => {
    // It used to: the input and the text shared a <label>, which made the whole
    // row a hit area. Agreeing that a rejection is final is not something a
    // reviewer should be able to do by clicking near the words describing it.
    render(<Harness />);

    fireEvent.click(
      screen.getByText(/reviewed this store and it can't be fixed/i),
    );

    expect(ack()).not.toBeChecked();
  });

  it("still announces what the box means", () => {
    // Dropping the <label> must not drop the accessible name with it.
    render(<Harness />);

    expect(ack()).toHaveAccessibleName(
      /reviewed this store and it can't be fixed with a revision/i,
    );
  });

  it("does not leak the gate into the revision path", () => {
    // Asking for changes is reversible for the seller, so it carries no gate.
    render(<Harness initial="revise" />);
    type("The permit scan is unreadable");

    expect(reviseBtn()).not.toBeDisabled();
  });

  it("submits the trimmed note", () => {
    render(<Harness />);
    type("   Address could not be verified   ");
    fireEvent.click(ack());
    fireEvent.click(rejectBtn());

    expect(onSubmit).toHaveBeenCalledWith("Address could not be verified");
  });
});

describe("switching to the revision path", () => {
  it("swaps mode in place and keeps what was typed", () => {
    // The warning names a better path; making the reviewer close, re-find the
    // row and retype would just push them through the rejection instead.
    render(<Harness />);
    type("The permit scan is unreadable");

    fireEvent.click(
      screen.getByRole("button", { name: /request changes instead/i }),
    );

    expect(screen.queryByText(/rejection is final/i)).toBeNull();
    expect(reasonBox()).toHaveValue("The permit scan is unreadable");
    expect(reviseBtn()).not.toBeDisabled();
  });

  it("offers a way back, so a change of mind does not cost the typed note", () => {
    render(<Harness initial="revise" />);
    type("The permit scan is unreadable");

    fireEvent.click(
      screen.getByRole("button", { name: /reject this store instead/i }),
    );

    expect(screen.getByText(/rejection is final/i)).toBeTruthy();
    expect(reasonBox()).toHaveValue("The permit scan is unreadable");
  });

  it("clears the acknowledgement on the way back to Reject", () => {
    // The regression worth a named test: without the reset, a reviewer could
    // tick the box, flip to Request changes, flip back, and reject having
    // agreed to nothing — the guard still drawn, no longer guarding.
    render(<Harness />);
    type("Address could not be verified");
    fireEvent.click(ack());
    expect(rejectBtn()).not.toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: /request changes instead/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /reject this store instead/i }),
    );

    expect(ack()).not.toBeChecked();
    expect(rejectBtn()).toBeDisabled();
  });
});

describe("the length cap", () => {
  it("caps input at what the API accepts", () => {
    // The server's Joi validator refuses anything past 1000 and discards the
    // whole submission with it, so the limit belongs where the typing happens.
    render(<Harness />);

    expect(reasonBox()).toHaveAttribute("maxlength", "1000");
  });

  it("counts what has been written", () => {
    render(<Harness />);
    type("a".repeat(120));

    expect(screen.getByText("120 / 1000")).toBeTruthy();
  });

  it("starts at zero", () => {
    render(<Harness />);

    expect(screen.getByText("0 / 1000")).toBeTruthy();
  });
});

describe("dismissing", () => {
  it("closes on Escape", () => {
    render(<Harness />);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalled();
  });

  it("survives a stray click on the backdrop", () => {
    // Unlike ConfirmDialog, this one holds text the reviewer wrote. Closing it
    // on an outside click would discard a half-written rejection reason.
    render(<Harness />);
    type("Address could not be verified");

    const backdrop = document.querySelector(".fixed.inset-0");
    fireEvent.click(backdrop!);

    expect(onCancel).not.toHaveBeenCalled();
    expect(reasonBox()).toHaveValue("Address could not be verified");
  });
});
