import { useRef } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFrameWhileVisible } from "../useFrameWhileVisible";

let intersect: (isIntersecting: boolean) => void = () => {};

class FakeIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    intersect = (isIntersecting) =>
      cb(
        [{ isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
  observe() {}
  disconnect() {}
}

function Probe({ onFrame }: { onFrame: () => boolean | void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrameWhileVisible(ref, onFrame);
  return <div ref={ref} />;
}

describe("useFrameWhileVisible", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "performance"] });
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("runs on scroll, settles, then stops while the page is still", () => {
    const onFrame = vi.fn();
    render(<Probe onFrame={onFrame} />);
    expect(onFrame).toHaveBeenCalledTimes(1); // the mount call

    act(() => intersect(true));
    act(() => vi.advanceTimersByTime(2000));
    const afterWake = onFrame.mock.calls.length;
    expect(afterWake).toBeGreaterThan(1);

    // Nothing scrolls: no more frames.
    act(() => vi.advanceTimersByTime(5000));
    expect(onFrame).toHaveBeenCalledTimes(afterWake);

    // A scroll wakes it again.
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(100);
    });
    expect(onFrame.mock.calls.length).toBeGreaterThan(afterWake);
  });

  it("keeps running while the frame reports it is still settling", () => {
    let settling = true;
    const onFrame = vi.fn(() => settling);
    render(<Probe onFrame={onFrame} />);
    act(() => intersect(true));

    act(() => vi.advanceTimersByTime(5000));
    const whileSettling = onFrame.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(onFrame.mock.calls.length).toBeGreaterThan(whileSettling);

    settling = false;
    act(() => vi.advanceTimersByTime(3000));
    const settled = onFrame.mock.calls.length;
    act(() => vi.advanceTimersByTime(3000));
    expect(onFrame).toHaveBeenCalledTimes(settled);
  });

  it("stops listening once the element leaves the screen", () => {
    const onFrame = vi.fn();
    render(<Probe onFrame={onFrame} />);
    act(() => intersect(true));
    act(() => intersect(false));
    const calls = onFrame.mock.calls.length;

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(2000);
    });
    expect(onFrame).toHaveBeenCalledTimes(calls);
  });
});
