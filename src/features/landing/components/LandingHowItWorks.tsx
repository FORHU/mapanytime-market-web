"use client";

import {
  useReducer,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  Loader,
  Plus,
  Pointer,
  RotateCcw,
  Send,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { Bezel } from "./ui/Bezel";
import { PillButton } from "./ui/PillButton";
import { Reveal } from "./ui/Reveal";
import {
  CART_ITEMS,
  HOW_STEPS,
  MAP_STORES,
  SHOP_PRODUCT,
} from "../landing.content";
import { useReducedMotion } from "../hooks/useReducedMotion";

/* ── State ──────────────────────────────────────────────────────────────── */

interface DemoState {
  step: number;
  /** Which steps the visitor has completed by trying the step's action. */
  done: boolean[];
  store: number;
  added: boolean;
  placed: boolean;
}

type DemoAction =
  | { type: "go"; step: number }
  | { type: "pickStore"; store: number }
  | { type: "add" }
  | { type: "place" }
  | { type: "reset" };

const INITIAL: DemoState = {
  step: 0,
  done: HOW_STEPS.map(() => false),
  store: 0,
  added: false,
  placed: false,
};

function markDone(done: boolean[], i: number) {
  return done.map((d, k) => (k === i ? true : d));
}

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "go":
      return { ...state, step: action.step };
    case "pickStore":
      return { ...state, store: action.store, done: markDone(state.done, 0) };
    case "add":
      return { ...state, added: true, done: markDone(state.done, 1) };
    case "place":
      return { ...state, placed: true, done: markDone(state.done, 2) };
    case "reset":
      return INITIAL;
  }
}

/* ── Section ────────────────────────────────────────────────────────────── */

/**
 * "How it works" as a guided walkthrough: four big step tabs drive one demo stage, and each of the
 * first three steps has a single action the visitor can try. Nothing advances on its own.
 */
export function LandingHowItWorks() {
  const reduce = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = HOW_STEPS.length - 1;

  const go = (step: number, focus = false) => {
    dispatch({ type: "go", step });
    if (focus) tabRefs.current[step]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    go((i + delta + HOW_STEPS.length) % HOW_STEPS.length, true);
  };

  return (
    <section id="how" className="lp-sec" aria-labelledby="lp-how-title">
      <div className="lp-wrap">
        <Reveal className="lp-head">
          <h2 id="lp-how-title" className="lp-h2">
            How it works.
          </h2>
          <p className="lp-lede">
            Four steps from finding a store to holding your order. Tap a step,
            or try each one below.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="lp-steps"
            role="tablist"
            aria-label="How MapAnytime works"
          >
            {HOW_STEPS.map((s, i) => {
              const on = i === state.step;
              const done = state.done[i] && !on;
              return (
                <button
                  key={s.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`lp-step-tab-${i}`}
                  aria-selected={on}
                  aria-controls="lp-step-panel"
                  tabIndex={on ? 0 : -1}
                  className={clsx("lp-step", on && "is-on", done && "is-done")}
                  onClick={() => go(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <span className="lp-step__num" aria-hidden="true">
                    {done ? <Check /> : i + 1}
                  </span>
                  <strong>{s.title}</strong>
                  <small>{s.hint}</small>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <Bezel
            className="lp-stage"
            id="lp-step-panel"
            role="tabpanel"
            aria-labelledby={`lp-step-tab-${state.step}`}
          >
            <div className="lp-stage__vis">
              <DiscoverDemo
                active={state.step === 0}
                store={state.store}
                onPick={(store) => dispatch({ type: "pickStore", store })}
              />
              <ShopDemo
                active={state.step === 1}
                added={state.added}
                onAdd={() => dispatch({ type: "add" })}
              />
              <PurchaseDemo
                active={state.step === 2}
                placed={state.placed}
                onPlace={() => dispatch({ type: "place" })}
              />
              <PickupDemo active={state.step === 3} />
            </div>

            <div className="lp-stage__txt">
              {HOW_STEPS.map((s, i) => {
                const on = i === state.step;
                const isLast = i === last;
                return (
                  <div
                    key={s.title}
                    className={clsx("lp-pt", on && "is-on")}
                    aria-hidden={!on}
                  >
                    <h3>{s.heading}</h3>
                    <p>{s.body}</p>
                    {s.todo && (
                      <span
                        className={clsx("lp-todo", state.done[i] && "is-done")}
                        aria-live="polite"
                      >
                        {state.done[i] ? <Check /> : <Pointer />}
                        {state.done[i] ? s.doneText : s.todo}
                      </span>
                    )}
                    <div className="lp-pt__nav">
                      {i > 0 && (
                        <button
                          type="button"
                          className="lp-round"
                          aria-label={`Back to ${HOW_STEPS[i - 1].title}`}
                          onClick={() => go(i - 1)}
                        >
                          <ArrowLeft />
                        </button>
                      )}
                      {isLast ? (
                        <>
                          <PillButton href="#install" icon={ArrowDownRight}>
                            Install the App
                          </PillButton>
                          <button
                            type="button"
                            className="lp-round"
                            aria-label="Start over"
                            onClick={() => dispatch({ type: "reset" })}
                          >
                            <RotateCcw />
                          </button>
                        </>
                      ) : (
                        <PillButton
                          icon={ArrowRight}
                          onClick={() => go(i + 1)}
                          className={clsx(
                            state.done[i] && !reduce && "lp-btn--nudge",
                          )}
                        >
                          {`Next: ${HOW_STEPS[i + 1].title}`}
                        </PillButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Demo panels ────────────────────────────────────────────────────────── */

function DiscoverDemo({
  active,
  store,
  onPick,
}: {
  active: boolean;
  store: number;
  onPick: (store: number) => void;
}) {
  const s = MAP_STORES[store];
  return (
    <div
      className={clsx("lp-pv lp-pv--map", active && "is-on")}
      aria-hidden={!active}
    >
      <div className="lp-mapbox">
        <Image
          src="/landing/app-map.jpg"
          alt="The MapAnytime app map of Baguio City with store markers"
          width={1295}
          height={727}
          sizes="(max-width: 1000px) 140vw, 1000px"
        />
        {MAP_STORES.map((m, i) => (
          <button
            key={m.initials}
            type="button"
            className="lp-hot"
            style={
              { left: `${m.x}%`, top: `${m.y}%`, "--i": i } as CSSProperties
            }
            aria-pressed={i === store}
            aria-label={`Open ${m.name}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onPick(i)}
          />
        ))}
      </div>
      <span className="lp-tap-hint">
        <Pointer />
        Tap a store marker
      </span>
      <Bezel
        key={store}
        size="sm"
        className="lp-store-card lp-float lp-pop"
        coreClassName="lp-store-card__body"
      >
        <div className="lp-store-card__row">
          <span className="lp-avatar" style={{ background: s.color }}>
            {s.initials}
          </span>
          <span>
            <b>{s.name}</b>
            <small>{s.area}</small>
          </span>
        </div>
        <span className="lp-mono">{s.distance}</span>
      </Bezel>
    </div>
  );
}

function ShopDemo({
  active,
  added,
  onAdd,
}: {
  active: boolean;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      className={clsx("lp-pv lp-pv--shop", active && "is-on")}
      aria-hidden={!active}
    >
      <Image
        src="/landing/app-store.jpg"
        alt="A store page in the MapAnytime app showing its products"
        fill
        sizes="(max-width: 1000px) 100vw, 680px"
      />
      <span
        key={added ? "two" : "one"}
        className={clsx("lp-bag", added && "lp-bump")}
        aria-label={`Cart, ${added ? 2 : 1} items`}
      >
        <ShoppingBag />
        <b>{added ? 2 : 1}</b>
      </span>
      <Bezel
        size="sm"
        className="lp-prod lp-float"
        coreClassName="lp-prod__body"
      >
        <span>
          <b>{SHOP_PRODUCT.name}</b>
          <small>{SHOP_PRODUCT.store}</small>
        </span>
        <button
          type="button"
          className={clsx("lp-demo-btn", added && "is-done")}
          onClick={onAdd}
          disabled={added}
          tabIndex={active ? 0 : -1}
        >
          {added ? <Check /> : <Plus />}
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </Bezel>
    </div>
  );
}

function PurchaseDemo({
  active,
  placed,
  onPlace,
}: {
  active: boolean;
  placed: boolean;
  onPlace: () => void;
}) {
  return (
    <div
      className={clsx("lp-pv lp-pv--cart", active && "is-on")}
      aria-hidden={!active}
    >
      <Bezel
        size="sm"
        className="lp-cart lp-float"
        coreClassName="lp-cart__body"
      >
        <div className="lp-cart__head">
          <b>Your cart</b>
          <span className="lp-mono">2 stores</span>
        </div>
        {CART_ITEMS.map(({ icon: Icon, name, store }) => (
          <div key={name} className="lp-cart__item">
            <span className="lp-cart__thumb" aria-hidden="true">
              <Icon />
            </span>
            <span>
              <b>{name}</b>
              <small>{store}</small>
            </span>
            <span className="lp-mono">x1</span>
          </div>
        ))}
        <div className="lp-cart__status">
          <span>Order status</span>
          <span className="lp-tag">
            {placed ? <Loader /> : <ShoppingCart />}
            {placed ? "Processing" : "In cart"}
          </span>
        </div>
        <button
          type="button"
          className={clsx("lp-demo-btn", placed && "is-done")}
          onClick={onPlace}
          disabled={placed}
          tabIndex={active ? 0 : -1}
        >
          {placed ? <Check /> : <Send />}
          {placed ? "Order placed" : "Place pickup order"}
        </button>
      </Bezel>
    </div>
  );
}

function PickupDemo({ active }: { active: boolean }) {
  return (
    <div
      className={clsx("lp-pv lp-pv--pick", active && "is-on")}
      aria-hidden={!active}
    >
      <Image
        src="/landing/pickup.jpg"
        alt="A shopper collecting her order at a store counter"
        fill
        sizes="(max-width: 1000px) 100vw, 680px"
      />
      <Bezel size="sm" className="lp-pick-card lp-float">
        <div className="lp-note">
          <span className="lp-note__ring" aria-hidden="true">
            <BellRing />
          </span>
          <span>
            <b>Your order is ready for pickup</b>
            <small>{SHOP_PRODUCT.store}, 1 item</small>
          </span>
        </div>
      </Bezel>
    </div>
  );
}
