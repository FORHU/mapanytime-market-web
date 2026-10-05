"use client";

import {
  Fragment,
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  BellRing,
  Check,
  Clock,
  Coffee,
  MapPin,
  Plus,
  ShoppingBag,
  Store,
  Ticket,
} from "lucide-react";
import { Reveal } from "./ui/Reveal";
import {
  HOW_STEPS,
  MAP_STORES,
  STORY_EXTRA_ITEM,
  STORY_ORDER_CODE,
  STORY_PRODUCTS,
  STORY_STORE,
  STORY_YOU,
} from "../landing.content";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useFrameWhileVisible } from "../hooks/useFrameWhileVisible";
import {
  PIN_ORIGIN_TARGETS,
  STORY_BEATS,
  STORY_VAR_TARGETS,
  follow,
  sceneAt,
  storyVars,
  visibleLayers,
  type StoryVar,
} from "../howStory";

/* The cart already holds the coffee from another store when the story starts. */
const ORDER_TOTAL =
  STORY_PRODUCTS.reduce((sum, p) => sum + p.price, 0) + STORY_EXTRA_ITEM.price;
const ITEM_COUNT = STORY_PRODUCTS.length + 1;

const peso = (n: number) => `₱${n}`;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * "How it works" as a scroll story. A tall track holds a sticky stage; scrolling through the track
 * plays five connected scenes (find, explore, choose, check out, pick up) as the section's full
 * background, with the matching headline over it. Timing lives in `howStory.ts`. Each frame writes custom
 * properties onto the few elements that read them and beat classes onto the stage, so the only
 * re-render is the scene change, and that re-renders only the headline copy.
 */
export function LandingHowItWorks() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const cartRef = useRef<HTMLSpanElement>(null);
  const cartCountRef = useRef<HTMLElement>(null);
  const totalRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef({
    /** Progress as painted, chasing the scroll position (see `follow`). */
    p: -1,
    /** Time of the last frame, for frame-rate independent smoothing. */
    t: 0,
    pinX: -1,
    pinY: -1,
    scene: 0,
    reduce,
    beats: new Set<string>(),
    /** Last value written per style key, so unchanged values cost no style work. */
    written: new Map<string, string>(),
    /** The elements each value is written to, looked up once (see `STORY_VAR_TARGETS`). */
    targets: null as Map<string, HTMLElement[]> | null,
    /** Cards whose photo flies to the cart at the start of the next frame, before any writes. */
    flights: [] as number[],
  });

  // A change of preference repaints the current position in the new mode.
  useEffect(() => {
    frame.current.reduce = reduce;
    frame.current.p = -1;
    frame.current.written.clear();
  }, [reduce]);

  /** The elements under the stage that `selector` names, cached per selector. */
  const targetsFor = (stage: HTMLElement, selector: string) => {
    const state = frame.current;
    state.targets ??= new Map();
    let els = state.targets.get(selector);
    if (!els) {
      els = Array.from(stage.querySelectorAll<HTMLElement>(selector));
      state.targets.set(selector, els);
    }
    return els;
  };

  /** Sets a custom property on `selector`'s elements, only when its value changed. */
  const write = (
    stage: HTMLElement,
    selector: string,
    prop: string,
    value: string,
  ) => {
    const written = frame.current.written;
    if (written.get(prop) === value) return;
    written.set(prop, value);
    for (const el of targetsFor(stage, selector)) {
      el.style.setProperty(prop, value);
    }
  };

  /** Sets text only when it differs, so an unchanged count costs no layout. */
  const setText = (el: HTMLElement | null, text: string) => {
    if (el && el.textContent !== text) el.textContent = text;
  };

  /**
   * Product photos leave their cards and drop into the cart bubble. Runs at the start of a frame:
   * every position is measured first, then the ghosts are added, so nothing forces a layout.
   */
  const flyToCart = (indexes: number[]) => {
    const cart = cartRef.current;
    if (!cart) return;
    const flights = indexes.flatMap((index) => {
      const crop =
        cardRefs.current[index]?.querySelector<HTMLElement>(".lp-crop");
      if (!crop || typeof crop.animate !== "function") return [];
      return [{ crop, from: crop.getBoundingClientRect() }];
    });
    if (!flights.length) return;
    const to = cart.getBoundingClientRect();
    for (const { crop, from } of flights) launch(crop, from, to, cart);
  };

  const launch = (
    crop: HTMLElement,
    from: DOMRect,
    to: DOMRect,
    cart: HTMLElement,
  ) => {
    const ghost = crop.cloneNode() as HTMLElement;
    ghost.classList.add("lp-ghost");
    Object.assign(ghost.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
    });
    document.body.appendChild(ghost);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const flight = ghost.animate(
      [
        { transform: "none", opacity: 1 },
        {
          transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.6) rotate(-8deg)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(0.12)`,
          opacity: 0.2,
        },
      ],
      { duration: 720, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
    );
    flight.onfinish = () => {
      ghost.remove();
      cart.classList.remove("lp-bump");
      void cart.offsetWidth; // restart the bump animation
      cart.classList.add("lp-bump");
    };
  };

  /** The order total ticks up as the items land in the checkout sheet. */
  const countUp = () => {
    const el = totalRef.current;
    if (!el) return;
    const start = performance.now();
    const step = (now: number) => {
      const k = clamp((now - start) / 900);
      el.textContent = peso(Math.round(ORDER_TOTAL * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const paint = (p: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const state = frame.current;

    const vars = storyVars(p, state.reduce);
    for (const key of Object.keys(vars) as StoryVar[]) {
      write(stage, STORY_VAR_TARGETS[key], `--${key}`, vars[key].toFixed(4));
    }
    const layers = visibleLayers(p);
    stage.classList.toggle("show-map", layers.map);
    stage.classList.toggle("show-store", layers.store);
    stage.classList.toggle("show-photo", layers.photo);

    for (const [beat, at] of STORY_BEATS) {
      const on = p >= at;
      if (on === state.beats.has(beat)) continue;
      if (on) state.beats.add(beat);
      else state.beats.delete(beat);
      stage.classList.toggle(`lp-${beat}`, on);
      if (!on || state.reduce) continue;
      if (beat.startsWith("b-add"))
        state.flights.push(Number(beat.slice(5)) - 1);
      if (beat === "b-items") countUp();
    }
    if (state.reduce) setText(totalRef.current, peso(ORDER_TOTAL));
    const added = STORY_PRODUCTS.filter((_, i) =>
      state.beats.has(`b-add${i + 1}`),
    ).length;
    setText(cartCountRef.current, String(1 + added));

    const next = sceneAt(p);
    if (next !== state.scene) {
      state.scene = next;
      setScene(next);
    }
  };

  useFrameWhileVisible(trackRef, () => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const state = frame.current;

    // All reads first, then writes, so a frame never forces a second layout.
    const now = performance.now();
    const dt = state.t ? Math.min(now - state.t, 100) : 16;
    state.t = now;
    // The stage's own height, not the window's: on phones the window grows when the address bar
    // hides, while the stage stays at 100svh, so the story would jump.
    const vh = stage.clientHeight;
    const box = track.getBoundingClientRect();
    const length = box.height - vh;
    const target = length > 0 ? clamp(-box.top / length) : 0;
    // The story glides after the scroll position instead of stepping with each wheel notch.
    const p = state.reduce ? target : follow(state.p, target, dt);

    // The store opens out of its pin, so the reveal circle needs the pin's spot in the frame.
    let pinMoved = false;
    const core = coreRef.current;
    const pin = pinRef.current;
    if (p < 0.42 && core && pin) {
      const c = core.getBoundingClientRect();
      const h = pin.getBoundingClientRect();
      const x = h.left + h.width / 2 - c.left;
      const y = h.top + h.height / 2 - c.top;
      if (Math.abs(x - state.pinX) > 0.5 || Math.abs(y - state.pinY) > 0.5) {
        state.pinX = x;
        state.pinY = y;
        pinMoved = true;
      }
    }

    // Last of the reads: photos for the beats the previous frame switched on.
    if (state.flights.length) {
      flyToCart(state.flights);
      state.flights = [];
    }

    if (pinMoved) {
      write(stage, PIN_ORIGIN_TARGETS, "--ox", `${state.pinX}px`);
      write(stage, PIN_ORIGIN_TARGETS, "--oy", `${state.pinY}px`);
    }
    if (p !== state.p || pinMoved) {
      state.p = p;
      paint(p);
    }
  });

  return (
    <section id="how" className="lp-sec lp-how" aria-labelledby="lp-how-title">
      <div className="lp-wrap">
        <Reveal className="lp-head">
          <h2 id="lp-how-title" className="lp-h2">
            How it works.
          </h2>
          <p className="lp-lede">
            From a pin on the map to a bag in your hand, in five steps.
          </p>
        </Reveal>
      </div>

      <div ref={trackRef} className="lp-track">
        <div
          ref={stageRef}
          className="lp-stage"
          data-scene={scene}
          style={{ "--ox": "50%", "--oy": "45%" } as CSSProperties}
        >
          <div className="lp-copy">
            <div className="lp-scenes">
              {HOW_STEPS.map((s, i) => (
                <div
                  key={s.heading}
                  className={clsx(
                    "lp-sc",
                    i === scene && "is-on",
                    i < scene && "is-past",
                  )}
                >
                  <h3>
                    <Words text={s.heading} />
                  </h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <StoryWorld
            coreRef={coreRef}
            pinRef={pinRef}
            cardRefs={cardRefs}
            cartRef={cartRef}
            cartCountRef={cartCountRef}
            totalRef={totalRef}
          />
        </div>
      </div>
    </section>
  );
}

/** Splits a headline into masked words that rise in one after another. */
function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="lp-w">
        <span style={{ "--i": i } as CSSProperties}>{word}</span>
      </span>
    </Fragment>
  ));
}

/*
 * The scene behind the copy. It never re-renders: every change is written straight to the DOM by
 * the frame loop, so the scene change re-renders only the headlines.
 */
const StoryWorld = memo(function StoryWorld({
  coreRef,
  pinRef,
  cardRefs,
  cartRef,
  cartCountRef,
  totalRef,
}: {
  coreRef: RefObject<HTMLDivElement | null>;
  pinRef: RefObject<HTMLSpanElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  cartRef: RefObject<HTMLSpanElement | null>;
  cartCountRef: RefObject<HTMLElement | null>;
  totalRef: RefObject<HTMLElement | null>;
}) {
  return (
    <div className="lp-world" aria-hidden="true">
      <div ref={coreRef} className="lp-world__core">
        <MapScene pinRef={pinRef} />
        <div className="lp-layer lp-fog" />
        <div className="lp-layer lp-dim" />
        <div className="lp-count">
          <b>{MAP_STORES.length + 1} stores</b>
          <span>within 2 km of you</span>
        </div>

        <div className="lp-layer lp-shop">
          <div className="lp-shop__shot" />
          <div className="lp-layer lp-shop__shade" />
        </div>
        <div className="lp-layer lp-dim2" />

        <div className="lp-layer lp-photo">
          <div className="lp-photo__ph">
            <Image
              src="/landing/pickup.jpg"
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 64vw"
              loading="eager"
              fetchPriority="low"
            />
          </div>
        </div>

        <div className="lp-layer lp-veil" />

        <StorePreview />

        <div className="lp-ui">
          <div className="lp-deck">
            {STORY_PRODUCTS.map((prod, i) => (
              <div
                key={prod.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="lp-pcard"
                data-card={i + 1}
              >
                <span className={`lp-crop lp-crop--${prod.crop}`} />
                <span className="lp-pcard__b">
                  <b>{prod.name}</b>
                  <small>{STORY_STORE.name}</small>
                  <span className="lp-pcard__row">
                    <span className="lp-mono lp-pcard__price">
                      {peso(prod.price)}
                    </span>
                    <span className="lp-add">
                      <Plus className="lp-no" />
                      <Check className="lp-yes" />
                      <span className="lp-no">Add</span>
                      <span className="lp-yes">Added</span>
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <span ref={cartRef} className="lp-cartb">
            <ShoppingBag />
            <b ref={cartCountRef}>1</b>
          </span>

          <Checkout totalRef={totalRef} />
          <Pickup />
        </div>
      </div>
    </div>
  );
});

/* ── Scenes ─────────────────────────────────────────────────────────────── */

const at = (x: number, y: number): CSSProperties => ({
  left: `${x}%`,
  top: `${y}%`,
});

/** Find and Explore: the app's map of Baguio, the shopper, nearby stores, and the store's pin. */
function MapScene({ pinRef }: { pinRef: RefObject<HTMLSpanElement | null> }) {
  return (
    <div className="lp-layer lp-cam">
      <div className="lp-layer lp-tilt">
        <div className="lp-smap">
          <Image
            src="/landing/app-map.jpg"
            alt=""
            width={1295}
            height={727}
            sizes="(max-width: 767px) 200vw, 110vw"
            // Loaded with the page (after the hero), so a fast scroll never reaches a blank map.
            loading="eager"
            fetchPriority="low"
          />
          <div className="lp-mks">
            {MAP_STORES.map((m, i) => (
              <span
                key={m.initials}
                className="lp-mk"
                data-mk={i + 1}
                style={at(m.x, m.y)}
              >
                <span className="lp-chip">
                  {m.name}
                  <span className="lp-mono">
                    {m.distance.replace(" away", "")}
                  </span>
                </span>
              </span>
            ))}
          </div>
          <span className="lp-you" style={at(STORY_YOU.x, STORY_YOU.y)} />
          <span className="lp-spin" style={at(STORY_STORE.x, STORY_STORE.y)}>
            <span className="lp-spin__shadow" />
            <span className="lp-spin__body">
              <span ref={pinRef} className="lp-spin__head" />
              <span className="lp-spin__ini">{STORY_STORE.initials}</span>
            </span>
            <span className="lp-spin__tap" />
            <span className="lp-chip lp-spin__chip">
              {STORY_STORE.name}
              <span className="lp-mono">{STORY_STORE.distance}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** The store card that pops out of the tapped pin. */
function StorePreview() {
  return (
    <div className="lp-preview">
      <div className="lp-preview__in">
        <div className="lp-preview__top">
          <span className="lp-preview__ava">{STORY_STORE.initials}</span>
          <span>
            <b>{STORY_STORE.name}</b>
            <small>{STORY_STORE.area}</small>
          </span>
        </div>
        <div className="lp-preview__meta">
          <span className="lp-tag">
            <Clock />
            {STORY_STORE.hours}
          </span>
          <span className="lp-tag">
            <MapPin />
            {STORY_STORE.distance}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Check out: the cart bubble grows into one checkout sheet for both stores. */
function Checkout({ totalRef }: { totalRef: RefObject<HTMLElement | null> }) {
  return (
    <div className="lp-sheet-pos">
      <div className="lp-sheet">
        <div className="lp-sheet__core">
          <div className="lp-sheet__head">
            <b>Your cart</b>
            <span>2 stores, {ITEM_COUNT} items</span>
          </div>
          <div className="lp-grp">
            <span className="lp-grp__name">
              <Store />
              {STORY_STORE.name}
            </span>
            {STORY_PRODUCTS.map((prod, i) => (
              <div
                key={prod.name}
                className="lp-line"
                style={{ "--i": i } as CSSProperties}
              >
                <span className={`lp-crop lp-crop--${prod.crop}`} />
                <span>
                  <b>{prod.name}</b>
                  <small>{prod.size}</small>
                </span>
                <span className="lp-mono">{peso(prod.price)}</span>
              </div>
            ))}
          </div>
          <div className="lp-grp">
            <span className="lp-grp__name">
              <Store />
              {STORY_EXTRA_ITEM.store}
            </span>
            <div
              className="lp-line"
              style={{ "--i": STORY_PRODUCTS.length } as CSSProperties}
            >
              <span className="lp-line__thumb">
                <Coffee />
              </span>
              <span>
                <b>{STORY_EXTRA_ITEM.name}</b>
                <small>{STORY_EXTRA_ITEM.size}</small>
              </span>
              <span className="lp-mono">{peso(STORY_EXTRA_ITEM.price)}</span>
            </div>
          </div>
          <div className="lp-sum">
            <span>Total</span>
            <b ref={totalRef} className="lp-mono">
              {peso(ORDER_TOTAL)}
            </b>
          </div>
          <div className="lp-place">
            <span className="lp-place__fill" />
            <span className="lp-no">Place order</span>
            <span className="lp-yes">
              <Check />
              Order placed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pick up: the ready notification, then the pickup pass is scanned at the counter. */
function Pickup() {
  return (
    <>
      <div className="lp-notif">
        <span className="lp-notif__ico">
          <BellRing />
        </span>
        <span>
          <span className="lp-notif__top">
            <span>MapAnytime</span>
            <span>now</span>
          </span>
          <span className="lp-notif__ready">
            <b>Your order is ready for pickup</b>
            <small>
              {STORY_STORE.name}, {STORY_PRODUCTS.length} items
            </small>
          </span>
          <span className="lp-notif__done">
            <b>Order picked up</b>
            <small>Thanks for shopping at {STORY_STORE.name}.</small>
          </span>
        </span>
      </div>

      <div className="lp-pass">
        <div className="lp-pass__core">
          <span className="lp-pass__label">
            <Ticket />
            Pickup pass
          </span>
          <span className="lp-qr">
            <PassCode />
            <span className="lp-qr__scan" />
          </span>
          <span className="lp-mono lp-pass__code">#{STORY_ORDER_CODE}</span>
          <small>
            Show this at the counter.
            <br />
            {STORY_STORE.address}
          </small>
          <span className="lp-stamp">
            <Check />
            Picked up
          </span>
        </div>
      </div>
    </>
  );
}

/*
 * A stand-in for the pass's scan code: a fixed pseudo-random grid with the three corner finder
 * squares, drawn on a 25x25 canvas and scaled up with crisp pixels. It is illustration only and
 * encodes nothing.
 */
function PassCode() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const n = 25;
    let seed = 4820;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, n, n);
    ctx.fillStyle = "#0b1620";
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) if (rnd() > 0.52) ctx.fillRect(x, y, 1, 1);
    }
    for (const [x, y] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(Math.max(0, x - 1), Math.max(0, y - 1), 8, 8);
      ctx.fillStyle = "#0b1620";
      ctx.fillRect(x, y, 7, 7);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 1, y + 1, 5, 5);
      ctx.fillStyle = "#0b1620";
      ctx.fillRect(x + 2, y + 2, 3, 3);
    }
  }, []);
  return <canvas ref={ref} width={25} height={25} />;
}
