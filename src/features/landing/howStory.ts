/*
 * Timeline of the How it works scroll story.
 *
 * The whole story is driven by one number, `p`: how far the visitor has scrolled through the
 * story track, from 0 to 1. Each of the five scenes owns a fifth of it. From `p` this module derives
 * the continuous values the CSS animates with (written as custom properties on the stage) and the
 * discrete beats that switch things on (written as classes). Kept free of React and the DOM so the
 * timing can be read, tuned and tested in one place.
 */

export const SCENE_COUNT = 5;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Progress through scene `i`, from 0 (not started) to 1 (finished). */
export function sceneProgress(p: number, i: number): number {
  return clamp((p - i / SCENE_COUNT) * SCENE_COUNT);
}

/** The scene on screen at progress `p`. */
export function sceneAt(p: number): number {
  return Math.min(SCENE_COUNT - 1, Math.floor(clamp(p) * SCENE_COUNT));
}

/** Names of the custom properties `storyVars` returns, without the leading `--`. */
export type StoryVar =
  | "tilt"
  | "dim"
  | "zoom"
  | "zs"
  | "reveal"
  | "shop"
  | "cA"
  | "cB"
  | "cC"
  | "sheet"
  | "fill"
  | "exit"
  | "pickIn"
  | "pick"
  | "pass";

/**
 * The continuous values for progress `p`. With `reduce` set, every value snaps from 0 to 1 at its
 * start instead of easing, so each scene shows its finished state with no zoom, pan or fly-in.
 */
export function storyVars(
  p: number,
  reduce: boolean,
): Record<StoryVar, number> {
  const seg = (t: number, a: number, b: number) =>
    reduce ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a));
  const [t0, t1, t2, t3, t4] = [0, 1, 2, 3, 4].map((i) => sceneProgress(p, i));

  const zoom = easeInOut(seg(t1, 0, 0.45));
  return {
    // Find: the map flies in tilted and dim, then lies flat and comes into focus.
    tilt: easeInOut(seg(t0, 0, 0.7)),
    dim: 1 - seg(t0, 0, 0.45),
    // Explore: zoom into the store's pin, then the store opens out of it.
    zoom,
    zs: 1 + zoom * 1.7,
    reveal: easeInOut(seg(t1, 0.64, 1)),
    // Choose: the store page drifts up while three product cards swing in, staggered.
    shop: seg(t2, 0, 1),
    cA: easeOut(seg(t2, 0, 0.3)),
    cB: easeOut(seg(t2, 0.07, 0.37)),
    cC: easeOut(seg(t2, 0.14, 0.44)),
    // Check out: the cart grows into the checkout sheet; the order button fills.
    sheet: easeOut(seg(t3, 0, 0.24)),
    fill: seg(t3, 0.5, 0.8),
    // Pick up: the sheet drops away, the counter photo settles, the pass flips up.
    exit: easeInOut(seg(t4, 0, 0.2)),
    pickIn: seg(t4, 0, 0.16),
    pick: seg(t4, 0, 1),
    pass: easeOut(seg(t4, 0.28, 0.52)),
  };
}

/*
 * Where each value is written: the elements whose CSS reads it (their descendants inherit it).
 * Writing a custom property on the stage itself would restyle the whole scene every frame, which
 * costs a phone several milliseconds; written here it touches only the few elements that use it.
 * A new `var(--x)` in landing.css needs its element listed here (a test checks this).
 */
export const STORY_VAR_TARGETS: Record<StoryVar, string> = {
  tilt: ".lp-tilt, .lp-fog",
  dim: ".lp-dim",
  zoom: ".lp-mks, .lp-spin__chip, .lp-count",
  zs: ".lp-smap, .lp-preview",
  reveal: ".lp-shop, .lp-preview",
  shop: ".lp-shop__shot, .lp-pcard",
  cA: '.lp-pcard[data-card="1"]',
  cB: '.lp-pcard[data-card="2"], .lp-shop__shade',
  cC: '.lp-pcard[data-card="3"]',
  sheet: ".lp-dim2, .lp-pcard, .lp-cartb, .lp-sheet",
  fill: ".lp-place__fill",
  exit: ".lp-sheet",
  pickIn: ".lp-photo",
  pick: ".lp-photo",
  pass: ".lp-pass",
};

/** Where the pin's position in the frame (`--ox`, `--oy`) is written. */
export const PIN_ORIGIN_TARGETS = ".lp-shop, .lp-preview";

/** One-off moments, as `[class on the stage, progress where it switches on]`. */
export const STORY_BEATS = [
  ["b-you", 0.012],
  ["b-mk1", 0.06],
  ["b-mk2", 0.08],
  ["b-mk3", 0.1],
  ["b-pin", 0.13],
  ["b-count", 0.165],
  ["b-tap", 0.29],
  ["b-preview", 0.302],
  ["b-store", 0.34],
  ["b-add1", 0.5],
  ["b-add2", 0.528],
  ["b-add3", 0.556],
  ["b-items", 0.635],
  ["b-placed", 0.764],
  ["b-notify", 0.83],
  ["b-scan", 0.924],
  ["b-done", 0.956],
] as const;

export type StoryBeat = (typeof STORY_BEATS)[number][0];

/*
 * Which layers need painting at `p`. Hidden layers are switched to `visibility: hidden` so the
 * browser stops compositing a scaled map under a full-bleed photo.
 */
export function visibleLayers(p: number) {
  return {
    map: p < 0.41,
    store: p > 0.29 && p < 0.84,
    photo: p > 0.79,
  };
}

/*
 * Smoothing. Scroll arrives in steps (a mouse wheel moves ~100px a notch), so driving the story
 * straight from the scroll position makes the zooms and cards jump. Instead the shown progress
 * chases the real one, closing most of the gap within SMOOTHING_MS whatever the frame rate. A
 * jump bigger than SNAP_DISTANCE (a nav link or anchor landing mid-story) is taken at once, so
 * the story does not replay every beat on the way there.
 */
export const SMOOTHING_MS = 140;
const SNAP_DISTANCE = 0.3;

/** Moves `shown` toward `target` for a frame that took `dt` ms. A negative `shown` means "unset". */
export function follow(shown: number, target: number, dt: number): number {
  if (shown < 0 || Math.abs(target - shown) > SNAP_DISTANCE) return target;
  const next = shown + (target - shown) * (1 - Math.exp(-dt / SMOOTHING_MS));
  return Math.abs(target - next) < 0.0001 ? target : next;
}
