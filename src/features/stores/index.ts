/**
 * Public surface of the stores feature.
 *
 * Deliberately excludes StoreOnboardingForm. Re-exporting it here made this
 * barrel a bundle hazard: the form reaches MapSelection → mapbox-gl, so any
 * module importing *anything* from `@/features/stores` pulled in the whole map
 * engine. That is how `/seller/manage-stores` — a page with no map — ended up
 * at ~651 kB first-load JS.
 *
 * Import heavy components from their own paths:
 *   import StoreOnboardingForm from "@/features/stores/components/StoreOnboardingForm";
 *
 * Keep this file limited to light, leaf-level exports.
 */
export { StoreTypeSelectionModal } from "./components/StoreTypeSelectionModal";
export { useActiveStore } from "./hooks/useActiveStore";
export type { StoreType } from "./types";
