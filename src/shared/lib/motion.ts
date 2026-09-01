/**
 * Amplitude decays rather than the timing curve doing the work — a decaying
 * oscillation with linear timing reads as one object settling, where an eased
 * shake reads as a warped wobble.
 */
const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)", offset: 0.15 },
  { transform: "translateX(5px)", offset: 0.3 },
  { transform: "translateX(-3px)", offset: 0.45 },
  { transform: "translateX(2px)", offset: 0.6 },
  { transform: "translateX(-1px)", offset: 0.75 },
  { transform: "translateX(0)" },
];

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A brief horizontal shake, to point at the element that just failed.
 *
 * WAAPI rather than a CSS class: submitting the same wrong password twice has to
 * shake twice, and re-adding a class that is already applied does nothing without
 * a reflow hack or a re-key that would destroy focus. `element.animate()` starts a
 * fresh animation on every call, and runs off the main thread like any CSS
 * animation would.
 *
 * Silent under `prefers-reduced-motion` — the guard has to live here, because the
 * media query in globals.css governs CSS classes and cannot reach a WAAPI
 * animation. Only the movement goes; the error colours and text stay.
 */
export function shake(el: HTMLElement | null | undefined) {
  if (!el || typeof el.animate !== "function") return;
  if (prefersReducedMotion()) return;

  el.animate(SHAKE_KEYFRAMES, { duration: 300, easing: "linear" });
}
