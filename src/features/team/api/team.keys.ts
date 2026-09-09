export const teamKeys = {
  all: ["team"] as const,
  context: () => [...teamKeys.all, "context"] as const,
  stores: () => [...teamKeys.all, "stores"] as const,
  members: () => [...teamKeys.all, "members"] as const,
} as const;
