"use client";

import { useRef } from "react";
import { Truck, Users, Zap } from "lucide-react";
import { SectionLabel } from "./ui/SectionLabel";

const benefits = [
  {
    icon: <Zap size={18} />,
    title: "30-second listings",
    description: "No technical knowledge. No complicated dashboards.",
  },
  {
    icon: <Truck size={18} />,
    title: "Pickup-only economics",
    description: "No drivers, no routing, no 20–30% delivery commissions.",
  },
  {
    icon: <Users size={18} />,
    title: "Built for independent merchants",
    description:
      "Give neighborhood stores the digital visibility they deserve.",
  },
];

export function LandingBenefits() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnter = () => {
    videoRef.current?.play().catch(() => {});
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <section
      id="benefits"
      className="overflow-hidden bg-[#eef6f8] px-6 py-[120px] text-white max-landing-sm:px-[18px] max-landing-sm:py-[85px]"
    >
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_0.9fr] items-center gap-[100px] max-landing-lg:grid-cols-1 max-landing-lg:gap-[50px]">
        <div className="text-[#163441] max-landing-lg:mx-auto max-landing-lg:max-w-[700px] max-landing-lg:text-center">
          <SectionLabel>WHY MAPANYTIME</SectionLabel>

          <h2 className="mt-[14px] text-[clamp(38px,5vw,58px)] leading-[0.98] tracking-[-0.055em] [&_em]:not-italic [&_em]:text-[#0786a4]">
            The internet finally
            <br />
            works for <em>local shops.</em>
          </h2>

          <p className="mt-[22px] max-w-[530px] text-sm leading-[1.75] text-[#718792] max-landing-lg:mx-auto">
            Existing e-commerce platforms were designed around big businesses.
            MapAnytime is designed around the person behind the counter.
          </p>

          <div className="mt-[35px] grid gap-[14px]">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-center gap-[13px] rounded-[14px] border border-[rgba(0,50,70,0.07)] bg-white/[0.55] p-[15px]"
              >
                <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[11px] bg-[#dff6fb] text-[#087e9b]">
                  {benefit.icon}
                </div>

                <div>
                  <strong className="block text-[11px] text-[#24414d]">
                    {benefit.title}
                  </strong>
                  <span className="mt-[3px] block text-[9px] text-[#7b919b]">
                    {benefit.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[580px] items-center justify-center">
          <div className="absolute h-[400px] w-[400px] rounded-full bg-[rgba(34,211,238,0.16)] blur-[80px]" />

          {/* Phone frame — border, rounding, rotation, and shadow all
              preserved exactly as before. Padding is gone since there's
              no inner UI anymore; the video fills the entire bordered
              box edge-to-edge and is clipped to it via overflow-hidden +
              the same rounded-[40px] the frame always had. */}
          <div
            className="relative z-[2] w-[285px] min-h-[560px] rotate-3 overflow-hidden rounded-[40px] border-[7px] border-[#102f3e] bg-[#02141c] shadow-[0_45px_80px_rgba(20,55,70,0.2),0_0_0_1px_rgba(0,0,0,0.08)] transition duration-400 hover:rotate-0 hover:-translate-y-2 max-landing-sm:w-[270px]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {/* Notch — sits above the video (higher z-index) so it reads
                as hardware sitting on top of the screen, same as a real
                phone. */}
            <div className="absolute left-1/2 top-0 z-10 h-[19px] w-[90px] -translate-x-1/2 rounded-b-[15px] bg-[#102f3e]" />

            {/* The video IS the screen — fills the full frame from top to
                bottom, clipped to the frame's rounded corners by the
                parent's overflow-hidden. */}
            <video
              ref={videoRef}
              src="/placeholders/buying-tutorial.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
