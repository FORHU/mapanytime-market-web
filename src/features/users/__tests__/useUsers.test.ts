import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useUsers } from "@/features/users/hooks/useUsers";
import * as usersClient from "@/features/users/api/users.client";

// ── Wrapper ──────────────────────────────────────────────────────────────────
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const MOCK_USERS_DATA = {
  items: [
    {
      id: "1",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Smith",
      phoneNumber: null,
      avatarId: null,
      accountStatus: "ACTIVE",
      isEmailVerified: true,
      isOnBoarding: false,
      countryCode: "US",
      lastLoginAt: "2026-07-01T12:00:00.000Z",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-07-01T12:00:00.000Z",
    },
    {
      id: "2",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      phoneNumber: null,
      avatarId: null,
      accountStatus: "ACTIVE",
      isEmailVerified: true,
      isOnBoarding: false,
      countryCode: "US",
      lastLoginAt: "2026-06-15T08:30:00.000Z",
      createdAt: "2026-03-20T00:00:00.000Z",
      updatedAt: "2026-06-15T08:30:00.000Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
} as Awaited<ReturnType<typeof usersClient.getUsers>>;

describe("useUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns users data on successful fetch", async () => {
    vi.spyOn(usersClient, "getUsers").mockResolvedValue(MOCK_USERS_DATA);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(MOCK_USERS_DATA);
    expect(result.current.error).toBeNull();
  });

  it("returns error state when fetch fails", async () => {
    const mockError = new Error("Failed to fetch users");
    vi.spyOn(usersClient, "getUsers").mockRejectedValue(mockError);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it("calls getUsers exactly once on mount", async () => {
    const spy = vi
      .spyOn(usersClient, "getUsers")
      .mockResolvedValue(MOCK_USERS_DATA);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
