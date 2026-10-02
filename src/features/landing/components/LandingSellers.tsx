"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ShoppingBag, Store } from "lucide-react";
import { Bezel } from "./ui/Bezel";
import { PillButton } from "./ui/PillButton";
import { Reveal } from "./ui/Reveal";
import { SELLER_ORDERS, SELLER_TOOLS } from "../landing.content";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** Seller pitch: what a store owner gets, with a notification that shows orders arriving. */
export function LandingSellers() {
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef);
  const reduce = useReducedMotion();
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(
      () => setOrder((o) => (o + 1) % SELLER_ORDERS.length),
      3200,
    );
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <section
      id="sellers"
      className="lp-sec lp-sec--tight"
      aria-labelledby="lp-sellers-title"
    >
      <div className="lp-wrap">
        <Reveal>
          <div ref={panelRef}>
            <Bezel className="lp-sell">
              <div className="lp-sell__photo">
                <Image
                  src="/landing/seller.jpg"
                  alt="A seller photographing a product with her phone"
                  fill
                  sizes="(max-width: 1000px) 100vw, 560px"
                />
                <Bezel
                  key={order}
                  size="sm"
                  className="lp-sell__order lp-float lp-pop"
                >
                  <div className="lp-note">
                    <span className="lp-note__ring" aria-hidden="true">
                      <ShoppingBag />
                    </span>
                    <span>
                      <b>New pickup order</b>
                      <small>{SELLER_ORDERS[order]}</small>
                    </span>
                  </div>
                </Bezel>
              </div>

              <div className="lp-sell__body">
                <span className="lp-eyebrow">
                  <Store aria-hidden="true" />
                  For sellers
                </span>
                <h2 id="lp-sellers-title" className="lp-h2">
                  Put your store on the map.
                </h2>
                <p className="lp-lede">
                  Apply on the web, get approved, and shoppers nearby can find
                  you and order for pickup.
                </p>
                <div className="lp-tools">
                  {SELLER_TOOLS.map(({ icon: Icon, title, body }) => (
                    <div key={title} className="lp-tool">
                      <span className="lp-tool__ic" aria-hidden="true">
                        <Icon />
                      </span>
                      <b>{title}</b>
                      <span>{body}</span>
                    </div>
                  ))}
                </div>
                <PillButton
                  href="/register"
                  variant="dark"
                  icon={ArrowUpRight}
                  magnetic
                >
                  Sell on MapAnytime
                </PillButton>
              </div>
            </Bezel>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
