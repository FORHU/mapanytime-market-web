import { describe, it, expect } from "vitest";
import {
  SCENE_COUNT,
  SMOOTHING_MS,
  follow,
  STORY_BEATS,
  sceneAt,
  sceneProgress,
  storyVars,
  visibleLayers,
} from "../howStory";

describe("howStory", () => {
  it("gives each scene an equal share of the scroll", () => {
    expect(sceneAt(0)).toBe(0);
    expect(sceneAt(0.199)).toBe(0);
    expect(sceneAt(0.2)).toBe(1);
    expect(sceneAt(0.85)).toBe(4);
    expect(sceneAt(1)).toBe(SCENE_COUNT - 1);

    expect(sceneProgress(0.5, 2)).toBeCloseTo(0.5);
    expect(sceneProgress(0.1, 2)).toBe(0);
    expect(sceneProgress(0.9, 2)).toBe(1);
  });

  it("starts with the map tilted and dim, and ends on the pickup", () => {
    const start = storyVars(0, false);
    expect(start.tilt).toBe(0);
    expect(start.dim).toBe(1);
    expect(start.reveal).toBe(0);

    const end = storyVars(1, false);
    expect(end.tilt).toBe(1);
    expect(end.reveal).toBe(1);
    expect(end.exit).toBe(1);
    expect(end.pass).toBe(1);
    expect(end.zs).toBeCloseTo(2.7);
  });

  it("keeps every value between 0 and 1 (the zoom scale aside)", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      for (const [key, value] of Object.entries(storyVars(p, false))) {
        if (key === "zs") continue;
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("snaps instead of easing under reduced motion", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      for (const [key, value] of Object.entries(storyVars(p, true))) {
        if (key === "zs" || key === "dim") continue;
        expect([0, 1]).toContain(value);
      }
    }
  });

  it("orders its beats along the story", () => {
    const at = STORY_BEATS.map(([, p]) => p);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    // Each scene's beats fall inside that scene.
    expect(sceneAt(STORY_BEATS.find(([b]) => b === "b-pin")![1])).toBe(0);
    expect(sceneAt(STORY_BEATS.find(([b]) => b === "b-tap")![1])).toBe(1);
    expect(sceneAt(STORY_BEATS.find(([b]) => b === "b-add1")![1])).toBe(2);
    expect(sceneAt(STORY_BEATS.find(([b]) => b === "b-placed")![1])).toBe(3);
    expect(sceneAt(STORY_BEATS.find(([b]) => b === "b-done")![1])).toBe(4);
  });

  it("only paints the layers in play", () => {
    expect(visibleLayers(0)).toEqual({ map: true, store: false, photo: false });
    expect(visibleLayers(0.5)).toEqual({
      map: false,
      store: true,
      photo: false,
    });
    expect(visibleLayers(1)).toEqual({ map: false, store: false, photo: true });
  });

  it("glides toward the scroll position instead of jumping to it", () => {
    // One frame closes part of the gap, never overshooting.
    const one = follow(0.4, 0.45, 16);
    expect(one).toBeGreaterThan(0.4);
    expect(one).toBeLessThan(0.45);

    // After the smoothing window most of the gap is gone, whatever the frame rate.
    let at60 = 0.4;
    for (let t = 0; t < SMOOTHING_MS; t += 1000 / 60)
      at60 = follow(at60, 0.45, 1000 / 60);
    let at120 = 0.4;
    for (let t = 0; t < SMOOTHING_MS; t += 1000 / 120)
      at120 = follow(at120, 0.45, 1000 / 120);
    expect(at60).toBeGreaterThan(0.43);
    expect(at60).toBeCloseTo(at120, 2);

    // It settles exactly on the target.
    let settle = 0.4;
    for (let k = 0; k < 200; k++) settle = follow(settle, 0.45, 16);
    expect(settle).toBe(0.45);
  });

  it("takes big jumps and the first frame at once", () => {
    expect(follow(-1, 0.6, 16)).toBe(0.6);
    expect(follow(0.05, 0.9, 16)).toBe(0.9);
  });
});
