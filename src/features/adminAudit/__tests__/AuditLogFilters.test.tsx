import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuditLogFilters } from "../components/AuditLogFilters";

describe("AuditLogFilters (MA-11)", () => {
  it("renders all filter controls and fires change events", () => {
    const onActionChange = vi.fn();
    const onStaffSearchChange = vi.fn();
    const onFromDateChange = vi.fn();
    const onToDateChange = vi.fn();
    const onReset = vi.fn();

    const { rerender } = render(
      <AuditLogFilters
        action="ALL"
        onActionChange={onActionChange}
        staffSearch=""
        onStaffSearchChange={onStaffSearchChange}
        fromDate=""
        onFromDateChange={onFromDateChange}
        toDate=""
        onToDateChange={onToDateChange}
        onReset={onReset}
      />,
    );

    const actionSelect = screen.getByLabelText("Filter by action");
    fireEvent.change(actionSelect, {
      target: { value: "ADMIN_INVITE_CREATED" },
    });
    expect(onActionChange).toHaveBeenCalledWith("ADMIN_INVITE_CREATED");

    const staffInput = screen.getByLabelText("Filter by staff member");
    fireEvent.change(staffInput, { target: { value: "admin-1" } });
    expect(onStaffSearchChange).toHaveBeenCalledWith("admin-1");

    const fromDateInput = screen.getByLabelText("Filter from date");
    fireEvent.change(fromDateInput, { target: { value: "2026-11-01" } });
    expect(onFromDateChange).toHaveBeenCalledWith("2026-11-01");

    // Reset button appears when filtered
    rerender(
      <AuditLogFilters
        action="ADMIN_INVITE_CREATED"
        onActionChange={onActionChange}
        staffSearch="admin-1"
        onStaffSearchChange={onStaffSearchChange}
        fromDate="2026-11-01"
        onFromDateChange={onFromDateChange}
        toDate=""
        onToDateChange={onToDateChange}
        onReset={onReset}
      />,
    );

    const resetButton = screen.getByText("Reset Filters");
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });
});
