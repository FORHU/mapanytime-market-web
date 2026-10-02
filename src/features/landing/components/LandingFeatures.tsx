"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Bezel } from "./ui/Bezel";
import { Reveal } from "./ui/Reveal";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useFrameWhileVisible } from "../hooks/useFrameWhileVisible";

/*
 * Features, as a media-first sequence: a full-bleed opener, split rows (media 7 / text 5) with one
 * full-width band in the middle to break the left/right rhythm, and a full-bleed sign-off line.
 * There is no button here on purpose: installing has its own section further down.
 *
 * It speaks the same visual language as the Hero and How it works: the landing tokens (--lp-*),
 * the hero's display type with the last line in brand blue, the double-bezel frame, and Reveal.
 *
 * Media is hotlinked. Photos come from Unsplash (images.unsplash.com is already allowed in
 * next.config.ts); looping clips come from Pexels through a plain <video>, which needs no image
 * config. Everything is free to use under the Unsplash and Pexels licenses.
 */

/** An Unsplash original, resized by Unsplash first so Next's optimizer starts from a sane file. */
const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=80`;

type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string };

interface Feature {
  label: string;
  heading: string;
  body: string;
  media: Media;
  /** Row shape: media left, media right, or a full-width band with the text below. */
  layout: "left" | "right" | "wide";
}

const FEATURES: Feature[] = [
  {
    label: "The live map",
    heading: "Every road leads to a store.",
    body: "MapAnytime maps the stores around you as they open, closest first. Wherever you're headed, you'll know what's on the way.",
    layout: "left",
    media: {
      kind: "video",
      src: "https://videos.pexels.com/video-files/2675508/2675508-hd_1280_720_24fps.mp4",
      poster: "https://images.pexels.com/videos/2675508/free-video-2675508.jpg",
    },
  },
  {
    label: "Live order status",
    heading: "Know the moment it's ready.",
    body: "Follow your order from placed to ready for pickup. MapAnytime tells you the second it's waiting.",
    layout: "right",
    media: {
      kind: "image",
      src: unsplash("photo-1483020563131-0100ca82cd49"),
      alt: "A man's face lit by his phone screen at night",
    },
  },
  {
    label: "The marketplace",
    heading: "The whole market, in your pocket.",
    body: "Browse stalls, shops and stands. Fill one cart from several and check out once.",
    layout: "wide",
    media: {
      kind: "video",
      src: "https://videos.pexels.com/video-files/7177514/7177514-hd_1280_720_60fps.mp4",
      poster:
        "https://images.pexels.com/videos/7177514/pexels-photo-7177514.jpeg",
    },
  },
  {
    label: "Pickup",
    heading: "Walk in. It's waiting.",
    body: "Every MapAnytime order is collected in person. Show your pickup pass at the counter and go.",
    layout: "left",
    media: {
      kind: "image",
      src: unsplash("photo-1761208158937-9f30aaea46b1"),
      alt: "A small shop glowing warm against a dark street at night",
    },
  },
];

const OPENER = {
  src: unsplash("photo-1520099588925-92807b402aa4"),
  alt: "Shoppers crowding a lantern-lit night market street",
};
const CLOSER_SRC = unsplash("photo-1517462035531-76bc910a6903");

/* The hero's headline treatment: display face, tight tracking, last line in brand blue. */
const DISPLAY = "font-bold leading-[0.95] tracking-[-0.05em] pb-[0.04em]";
const ACCENT = "block not-italic text-[var(--lp-brand-deep)]";
const LABEL =
  "[font-family:var(--lp-display)] text-[14px] font-bold tracking-[-0.01em] text-[var(--lp-brand-deep)]";

/** A layer that drifts against the scroll; its `data-par` ancestor sets how far. */
const DRIFT: CSSProperties = {
  transform: "translateY(calc(var(--par, 0) * 1px))",
};

/* Page colour washed over a photo so text on it stays readable (the hero's scrim recipe), and
   faded in at the top so the opener grows out of the page instead of starting at a hard edge. */
const OPENER_SCRIM: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--lp-bg) 0%, rgba(7,13,18,0) 22%), linear-gradient(0deg, var(--lp-bg) 0%, rgba(7,13,18,0) 34%), linear-gradient(90deg, rgba(7,13,18,0.94) 0%, rgba(7,13,18,0.82) 32%, rgba(7,13,18,0.3) 62%, rgba(7,13,18,0.05) 86%)",
};
const CLOSER_SCRIM: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--lp-bg) 0%, rgba(7,13,18,0) 30%, rgba(7,13,18,0) 70%, var(--lp-bg) 100%), linear-gradient(90deg, rgba(7,13,18,0.9) 0%, rgba(7,13,18,0.6) 45%, rgba(7,13,18,0.25) 100%)",
};

export function LandingFeatures() {
  const rootRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Gentle parallax: each [data-par] block is offset by how far its centre sits from the
  // viewport's, scaled by its factor. Runs only while the section is on screen.
  useFrameWhileVisible(rootRef, () => {
    const root = rootRef.current;
    if (!root || reduce) return;
    const vh = window.innerHeight;
    root.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -Number(el.dataset.par);
      el.style.setProperty("--par", offset.toFixed(1));
    });
  });

  return (
    <section
      ref={rootRef}
      id="features"
      aria-labelledby="lp-features-title"
      className="scroll-mt-24"
    >
      {/* Opener */}
      <div className="relative isolate">
        <div
          data-par="0.12"
          className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[21/9] md:max-h-[88vh] md:min-h-[560px]"
        >
          <div className="absolute inset-x-0 -inset-y-[8%]" style={DRIFT}>
            <Image
              src={OPENER.src}
              alt={OPENER.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={OPENER_SCRIM}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[1]">
          <Reveal className="lp-wrap grid gap-6 pb-10 md:pb-[72px]">
            <h2
              id="lp-features-title"
              className={clsx(
                DISPLAY,
                "max-w-[12ch] text-[clamp(46px,6.6vw,104px)]",
              )}
            >
              Every street. Every stall. <em className={ACCENT}>One map.</em>
            </h2>
            <p className="lp-lede !text-[var(--lp-ink-2)]">
              MapAnytime shows you what&apos;s open around you, live, and lets
              you buy it before you get there.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Feature rows */}
      <div className="lp-wrap">
        {FEATURES.map((f, i) => (
          <FeatureRow key={f.label} feature={f} first={i === 0} />
        ))}
      </div>

      {/* Sign-off */}
      <div className="relative isolate overflow-hidden">
        <div
          data-par="0.1"
          aria-hidden="true"
          className="absolute inset-0 -z-[1]"
        >
          <div className="absolute inset-x-0 -inset-y-[10%]" style={DRIFT}>
            <Image
              src={CLOSER_SRC}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0" style={CLOSER_SCRIM} />
        </div>
        <Reveal className="lp-wrap pb-[112px] pt-[140px] md:pb-[180px] md:pt-[200px]">
          <p
            className={clsx(
              DISPLAY,
              "max-w-[11ch] [font-family:var(--lp-display)] text-[clamp(46px,6.6vw,104px)] font-extrabold leading-[0.92] tracking-[-0.055em] text-[var(--lp-ink)] [text-wrap:balance]",
            )}
          >
            Every road. Every moment. <em className={ACCENT}>MapAnytime.</em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureRow({ feature, first }: { feature: Feature; first: boolean }) {
  const { layout } = feature;
  const wide = layout === "wide";

  const media = (
    <Reveal className={clsx(layout === "right" && "md:order-2")}>
      <Bezel
        className="group"
        coreClassName={clsx(
          "aspect-[4/3] !bg-[var(--lp-bg-2)]",
          wide ? "md:aspect-[16/7]" : "md:aspect-[5/4]",
        )}
      >
        <div
          data-par="0.08"
          className="absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <div className="absolute inset-x-0 -inset-y-[6%]" style={DRIFT}>
            {feature.media.kind === "image" ? (
              <Image
                src={feature.media.src}
                alt={feature.media.alt}
                fill
                sizes={
                  wide
                    ? "(max-width: 767px) 100vw, 1180px"
                    : "(max-width: 767px) 100vw, 700px"
                }
                className="object-cover"
              />
            ) : (
              <LoopVideo
                src={feature.media.src}
                poster={feature.media.poster}
              />
            )}
          </div>
        </div>
      </Bezel>
    </Reveal>
  );

  const text = (
    <Reveal
      className={clsx("grid content-center gap-5", wide && "max-w-[640px]")}
      delay={1}
    >
      <span className={LABEL}>{feature.label}</span>
      <h3
        className={clsx(
          DISPLAY,
          "text-[clamp(36px,3.8vw,58px)] leading-none tracking-[-0.045em]",
        )}
      >
        {feature.heading}
      </h3>
      <p className="lp-lede">{feature.body}</p>
    </Reveal>
  );

  return (
    <article
      className={clsx(
        "grid grid-cols-1 gap-8 py-[72px] md:py-[112px]",
        !first && "border-t border-[var(--lp-hair)]",
        first && "md:pt-24",
        wide
          ? "md:gap-12"
          : clsx(
              "items-center md:gap-[72px]",
              layout === "right"
                ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                : "md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
            ),
      )}
    >
      {media}
      {text}
    </article>
  );
}

/**
 * A muted, looping, inline clip. It loads nothing until it is near the screen, pauses when it
 * leaves, and under reduced motion never starts, so the poster frame stands in for it.
 */
function LoopVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduce || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [src, reduce]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
