"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Store, ShoppingBag, Users, Globe } from "lucide-react";

const CATEGORIES = [
  {
    id: "owners",
    label: "Store Owners",
    stop: "Stop 01",
    tagline: "List in seconds, sell without shipping.",
    accent: "var(--brand-core, var(--md-sys-color-primary, #00658d))",
    tabIcon: Store,
    items: [
      {
        title: "Easy listing",
        desc: "Turn one photo into a complete product listing in about 30 seconds using AI.",
      },
      {
        title: "No logistics",
        desc: "Pickup-only means no couriers, delivery costs, or complex fulfillment.",
      },
      {
        title: "Instant visibility",
        desc: "Products immediately appear on the map for nearby shoppers.",
      },
    ],
    images: [
      {
        src: "/placeholders/uploading-girl.jpg",
        alt: "Shop owner preparing products",
      },
      {
        src: "/placeholders/landing-benefits/pickup.jpg",
        alt: "Small shop counter",
      },
      {
        src: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&q=80&auto=format&fit=crop",
        alt: "Vendor arranging fresh goods",
      },
      {
        src: "/placeholders/landing-benefits/taking photo.jpg",
        alt: "Storefront on a neighborhood street",
      },
    ],
  },
  {
    id: "shoppers",
    label: "Shoppers",
    stop: "Stop 02",
    tagline: "Check what's in stock before you go.",
    accent: "var(--md-sys-color-secondary, #4f6170)",
    tabIcon: ShoppingBag,
    items: [
      {
        title: "Live inventory",
        desc: "See what products are actually available before visiting.",
      },
      {
        title: "Grab & go",
        desc: "Browse and pay ahead, then pick up without waiting in line.",
      },
      {
        title: "Local discovery",
        desc: "Find unique, handmade, seasonal, and hard-to-find products.",
      },
      { title: "Save money", desc: "Pickup eliminates delivery fees." },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80&auto=format&fit=crop",
        alt: "Shopper browsing a market",
      },
      {
        src: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80&auto=format&fit=crop",
        alt: "Person browsing a clothing rack",
      },
      {
        src: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=500&q=80&auto=format&fit=crop",
        alt: "Shopping bags",
      },
      {
        src: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&q=80&auto=format&fit=crop",
        alt: "Shopper picking fresh produce",
      },
    ],
  },
  {
    id: "community",
    label: "Communities",
    stop: "Stop 03",
    tagline: "Every purchase stays in the neighborhood.",
    accent: "var(--md-sys-color-tertiary, #5e5e5f)",
    tabIcon: Users,
    items: [
      {
        title: "Brings stores online",
        desc: "Gives small businesses digital visibility without needing their own website or app.",
      },
      {
        title: "Supports local businesses",
        desc: "Keeps more consumer spending within the community.",
      },
      {
        title: "Inclusive commerce",
        desc: "Helps small vendors, artisans, and market sellers participate in digital commerce.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&q=80&auto=format&fit=crop",
        alt: "Neighborhood street of shops",
      },
      {
        src: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=80&auto=format&fit=crop",
        alt: "Farmers market stall",
      },
      {
        src: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=500&q=80&auto=format&fit=crop",
        alt: "Artisan shaping pottery",
      },
      {
        src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=500&q=80&auto=format&fit=crop",
        alt: "Community members at a street fair",
      },
    ],
  },
  {
    id: "platform",
    label: "MapAnytime",
    stop: "Stop 04",
    tagline: "Built to grow one pin at a time.",
    accent:
      "var(--brand-vibrant, var(--md-sys-color-inverse-primary, #82cfff))",
    tabIcon: Globe,
    items: [
      {
        title: "Easy global scaling",
        desc: "Pickup-only operations make expansion to new markets faster and simpler.",
      },
      {
        title: "Network effect",
        desc: "More stores create a stronger local marketplace and more valuable data.",
      },
      {
        title: "Simpler regulation",
        desc: "Avoids many of the licensing and regulatory challenges associated with delivery services.",
      },
    ],
    images: [
      {
        src: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&q=80&auto=format&fit=crop",
        alt: "Map with a location pin",
      },
      {
        src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80&auto=format&fit=crop",
        alt: "Aerial view of a city",
      },
      {
        src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80&auto=format&fit=crop",
        alt: "World map",
      },
      {
        src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500&q=80&auto=format&fit=crop",
        alt: "City skyline lit up at dusk",
      },
    ],
  },
];

const PIN_SLOTS = [
  {
    cls: "matb-pos-0",
    size: 315,
    rot: -6,
    delay: 0,
    style: { top: "-9%", left: "-9%" },
  },
  {
    cls: "matb-pos-2",
    size: 265,
    rot: 5,
    delay: 180,
    style: { top: "-4%", right: "-9%" },
  },
  {
    cls: "matb-pos-3",
    size: 365,
    rot: -5,
    delay: 270,
    style: { bottom: "-12%", left: "-10%" },
  },
  {
    cls: "matb-pos-4",
    size: 350,
    rot: 4,
    delay: 360,
    style: { bottom: "-8%", right: "-6%" },
  },
];

type PinPhotoProps = {
  image: { src: string; alt: string };
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth: number;
  }>;
  accent: string;
  slot: {
    cls: string;
    size: number;
    rot: number;
    delay: number;
    style: React.CSSProperties;
  };
};

function PinPhoto({ image, icon: Icon, accent, slot }: PinPhotoProps) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className={`matb-pin-wrap ${slot.cls}`}
      style={
        {
          ...slot.style,
          width: slot.size,
          height: slot.size,
          "--rot": `${slot.rot}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className="matb-pin-float"
        style={{ animationDelay: `${slot.delay}ms` }}
      >
        <div className="matb-pin-shape">
          <div className="matb-pin-content">
            {!errored ? (
              <Image
                fill
                src={image.src}
                alt={image.alt}
                onError={() => setErrored(true)}
                draggable={false}
                className="object-cover"
              />
            ) : (
              <div
                className="matb-pin-fallback"
                style={{
                  background: `linear-gradient(135deg, ${accent}, var(--ink))`,
                }}
              >
                <Icon size={26} color="#fff" strokeWidth={1.75} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHowItWorks() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const category = CATEGORIES[active];

  return (
    <section
      className={`matb-root ${mounted ? "matb-mounted" : ""}`}
      style={{ "--accent": category.accent } as React.CSSProperties}
    >
      <style>{`
        .matb-root, .matb-root *, .matb-root *::before, .matb-root *::after { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .matb-root {
          --paper: var(--background-secondary, #f1f5f9);
          --ink: var(--text-primary, #021521);
          --line: var(--border-default, #c3c7cb);
          --line-light: var(--border-light, #dfe3e7);
          --card: var(--md-sys-color-surface-container-lowest, #ffffff);
          --accent: var(--brand-core, #00658d);
          position: relative;
          overflow: hidden;
          background: var(--paper);
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 96px 24px 112px;
          isolation: isolate;
        }

        .matb-root ul, .matb-root li, .matb-root h1, .matb-root h2, .matb-root h3, .matb-root p { margin: 0; padding: 0; }
        .matb-root button { font: inherit; }

        .matb-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(130, 207, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .matb-glow {
          position: absolute; width: 480px; height: 480px; border-radius: 50%;
          background: var(--accent); filter: blur(90px); opacity: 0.16;
          transition: background 0.6s ease; pointer-events: none;
          animation: matb-drift 16s ease-in-out infinite alternate;
        }
        .matb-glow-a { top: -140px; left: -120px; }
        .matb-glow-b { bottom: -160px; right: -100px; animation-duration: 20s; animation-direction: alternate-reverse; }
        @keyframes matb-drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.15); }
        }

        .matb-container { position: relative; z-index: 1; max-width: 1040px; margin: 0 auto; }

        .matb-header {
          text-align: center; max-width: 620px; margin: 0 auto 56px;
          opacity: 0; transform: translateY(16px);
          transition: opacity .7s ease, transform .7s ease;
        }
        .matb-mounted .matb-header { opacity: 1; transform: translateY(0); }

        .matb-kicker {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .16em;
          text-transform: uppercase; color: color-mix(in srgb, var(--ink) 60%, transparent);
          margin-bottom: 18px;
        }
        .matb-kicker-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); transition: background .5s ease; }

        .matb-h1 {
          font-family: 'Fraunces', serif; font-weight: 700; font-size: clamp(32px, 4.6vw, 48px);
          line-height: 1.08; letter-spacing: -0.01em; margin-bottom: 16px;
        }
        .matb-sub { font-size: 16px; line-height: 1.6; color: color-mix(in srgb, var(--ink) 62%, transparent); }

        .matb-tabs {
          position: relative; display: flex; justify-content: center; gap: clamp(10px, 4vw, 44px);
          margin-bottom: 64px;
          opacity: 0; transform: translateY(16px);
          transition: opacity .7s ease .1s, transform .7s ease .1s;
        }
        .matb-mounted .matb-tabs { opacity: 1; transform: translateY(0); }

        .matb-route-track { position: absolute; top: 20px; left: 12%; right: 12%; height: 2px; background: var(--line); z-index: 0; }
        .matb-route-fill { position: absolute; top: 0; left: 0; height: 2px; background: var(--accent); transition: width .6s cubic-bezier(.65,0,.35,1), background .5s ease; }

        .matb-tab {
          position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
          color: color-mix(in srgb, var(--ink) 55%, transparent);
        }
        .matb-tab-dot {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--card); border: 1.5px solid var(--line); color: var(--ink);
          transition: all .3s ease;
        }
        .matb-tab:hover .matb-tab-dot { transform: translateY(-3px); border-color: var(--accent); }
        .matb-tab-active .matb-tab-dot { background: color-mix(in srgb, var(--accent) 14%, var(--card)); border-color: var(--accent); color: var(--accent); box-shadow: 0 8px 20px -8px var(--accent); }
        .matb-tab-ping { position: absolute; inset: -6px; border-radius: 50%; background: var(--accent); opacity: .4; animation: matb-ping 2.2s cubic-bezier(0,0,.2,1) infinite; }
        @keyframes matb-ping { 0% { transform: scale(.7); opacity: .5; } 75%, 100% { transform: scale(1.9); opacity: 0; } }

        .matb-tab:focus-visible .matb-tab-dot,
        .matb-btn-ghost:focus-visible,
        .matb-btn-primary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

        @media (max-width: 560px) {
          .matb-tab-label { display: none; }
          .matb-route-track { left: 8%; right: 8%; }
        }

        .matb-stage { position: relative; display: flex; align-items: center; justify-content: center; min-height: 700px; }
        .matb-pins-layer { position: absolute; inset: 0; pointer-events: none; }

        .matb-pin-wrap { position: absolute; pointer-events: auto; transform: rotate(var(--rot)); transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
        .matb-pin-wrap:hover { transform: rotate(0deg) scale(1.08); z-index: 5; }

        .matb-pin-float {
          width: 100%; height: 100%;
          animation: matb-drop .6s cubic-bezier(.34,1.56,.64,1) both, matb-float 5s ease-in-out .6s infinite;
        }
        @keyframes matb-drop { from { opacity: 0; transform: translateY(-36px) scale(.6); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes matb-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .matb-pin-shape {
          position: relative; width: 100%; height: 100%;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 18px 34px -12px rgba(0,0,0,.4);
          border: 5px solid var(--card); background: var(--card);
        }
        .matb-pin-content { position: absolute; inset: 0; }
        .matb-pin-content img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .matb-pin-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

        /* Center content: no card, no icons — just floating type */
        .matb-card {
          position: relative; z-index: 2; width: min(440px, 88vw);
          text-align: center;
        }

        .matb-card-inner { animation: matb-card-in .6s cubic-bezier(.22,1,.36,1) both; }
        @keyframes matb-card-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .matb-card-eyebrow {
          display: flex; justify-content: center; align-items: center; gap: 12px;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 20px; transition: color .5s ease;
        }
        .matb-eyebrow-line { width: 22px; height: 1px; background: currentColor; opacity: .45; }

        .matb-card-title { font-family: 'Fraunces', serif; font-size: clamp(28px, 3.4vw, 34px); font-weight: 700; margin-bottom: 12px; letter-spacing: -0.01em; }
        .matb-card-tagline {
          font-family: 'Fraunces', serif; font-style: italic; font-weight: 500; font-size: 17px;
          color: color-mix(in srgb, var(--ink) 62%, transparent); margin-bottom: 28px; line-height: 1.5;
        }

        .matb-divider { width: 44px; height: 2px; margin: 0 auto 34px; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); transition: background .5s ease; }

        .matb-list { list-style: none; display: flex; flex-direction: column; align-items: center; gap: 26px; margin: 0 auto 36px; max-width: 380px; }
        .matb-list-item { display: flex; flex-direction: column; align-items: center; opacity: 0; animation: matb-item-in .55s ease both; }
        @keyframes matb-item-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .matb-item-marker { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); margin-bottom: 10px; transition: background .5s ease; }
        .matb-item-title { font-weight: 600; font-size: 15.5px; margin-bottom: 4px; letter-spacing: -0.01em; }
        .matb-item-desc { font-size: 13.5px; line-height: 1.6; color: color-mix(in srgb, var(--ink) 58%, transparent); }

        .matb-card-footer { display: flex; align-items: center; justify-content: center; gap: 30px; }
        .matb-btn-ghost {
          background: none; border: none; padding: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: color-mix(in srgb, var(--ink) 50%, transparent);
          transition: color .25s ease, transform .25s ease;
        }
        .matb-btn-ghost:hover { color: var(--accent); transform: translateX(-3px); }

        .matb-btn-primary {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; padding: 0 0 4px; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; font-weight: 500;
          color: var(--ink); transition: color .25s ease;
        }
        .matb-btn-primary::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1.5px; background: var(--accent);
          transform: scaleX(0); transform-origin: right; transition: transform .35s cubic-bezier(.65,0,.35,1);
        }
        .matb-btn-primary:hover { color: var(--accent); }
        .matb-btn-primary:hover::after { transform: scaleX(1); transform-origin: left; }
        .matb-btn-primary:active { transform: scale(.97); }
        .matb-btn-arrow { transition: transform .25s ease; }
        .matb-btn-primary:hover .matb-btn-arrow { transform: translateX(4px); }

        .matb-here { display: flex; justify-content: center; margin-top: 30px; }
        .matb-here-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); transition: background .5s ease; }
        .matb-here-dot::after {
          content: ''; position: absolute; inset: -7px; border-radius: 50%;
          background: var(--accent); opacity: .35; animation: matb-ping 2.2s cubic-bezier(0,0,.2,1) infinite;
        }

        @media (max-width: 860px) {
          .matb-stage { min-height: auto; flex-direction: column; gap: 28px; }
          .matb-pins-layer { position: static; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; order: 2; }
          .matb-pin-wrap { position: static !important; width: 130px !important; height: 130px !important; transform: none !important; }
          .matb-pin-float { animation: matb-drop .6s cubic-bezier(.34,1.56,.64,1) both; }
          .matb-card { order: 1; width: 100%; }
        }

        @media (max-width: 480px) {
          .matb-root { padding: 72px 16px 88px; }
          .matb-h1 { font-size: 28px; }
          .matb-card-title { font-size: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .matb-root *, .matb-root *::before, .matb-root *::after {
            animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <div className="matb-glow matb-glow-a" />
      <div className="matb-glow matb-glow-b" />
      <div className="matb-grid" />

      <div className="matb-container">
        <header className="matb-header">
          <span className="matb-kicker">
            <span className="matb-kicker-dot" /> MapAnytime
          </span>
          <h2 className="matb-h1">One map. Four reasons it works.</h2>
          <p className="matb-sub">
            Every pin connects a store, a shopper, and the neighborhood around
            them — with nothing to deliver.
          </p>
        </header>

        <nav className="matb-tabs" aria-label="Benefit categories">
          <div className="matb-route-track">
            <div
              className="matb-route-fill"
              style={{ width: `${(active / (CATEGORIES.length - 1)) * 100}%` }}
            />
          </div>
          {CATEGORIES.map((cat, i) => {
            const TabIcon = cat.tabIcon;
            const isActive = i === active;
            return (
              <button
                key={cat.id}
                className={`matb-tab ${isActive ? "matb-tab-active" : ""}`}
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                aria-label={cat.label}
              >
                <span className="matb-tab-dot">
                  {isActive && <span className="matb-tab-ping" />}
                  <TabIcon size={17} strokeWidth={2} />
                </span>
                <span className="matb-tab-label">{cat.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="matb-stage">
          <div className="matb-pins-layer">
            {PIN_SLOTS.map((slot, i) => (
              <PinPhoto
                key={`${active}-${i}`}
                image={category.images[i]}
                icon={category.tabIcon}
                accent={category.accent}
                slot={slot}
              />
            ))}
          </div>

          <div className="matb-card">
            <div className="matb-card-inner" key={active}>
              <h3 className="matb-card-title">For {category.label}</h3>
              <p className="matb-card-tagline">{category.tagline}</p>
              <div className="matb-divider" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingHowItWorks;
