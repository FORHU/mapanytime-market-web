export const pricingKeys = {
  all: ["admin", "pricing"] as const,
  configurations: () => [...pricingKeys.all, "configurations"] as const,
  configurationDetails: () =>
    [...pricingKeys.configurations(), "detail"] as const,
  configurationDetail: (id: string) =>
    [...pricingKeys.configurationDetails(), id] as const,
};
