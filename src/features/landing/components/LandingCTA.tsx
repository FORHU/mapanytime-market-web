import { ArrowRight, Store } from "lucide-react";
import Link from "next/link";

export function LandingCTA() {
  return (
    <section
      id="claim"
      className="relative flex min-h-[650px] items-center justify-center overflow-hidden bg-[#021521] px-6 py-[100px] max-landing-sm:min-h-[600px] max-landing-sm:px-5 max-landing-sm:py-20"
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      {/* Orbs */}
      <div className="pointer-events-none absolute -right-[180px] -top-[370px] h-[550px] w-[550px] rounded-full bg-[rgba(34,211,238,0.16)] blur-[2px]" />
      <div className="pointer-events-none absolute -bottom-[350px] -left-[150px] h-[500px] w-[500px] rounded-full bg-[rgba(255,95,109,0.11)] blur-[2px]" />

      <div className="relative z-[2] w-full max-w-[650px] text-center">
        <div className="mx-auto mb-[25px] flex h-[50px] w-[50px] items-center justify-center rounded-[15px] border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] text-[#22d3ee] shadow-[0_0_40px_rgba(34,211,238,0.1)]">
          <Store size={22} />
        </div>

        <span className="text-[9px] font-black tracking-[0.2em] text-[#5ecde0]">
          READY TO GET MAPPED?
        </span>

        <h2 className="mt-[17px] text-[clamp(45px,7vw,75px)] leading-[0.95] tracking-[-0.06em]">
          Put your shop
          <br />
          <span className="bg-gradient-to-r from-[#ff9a5b] to-[#ff5f6d] bg-clip-text text-transparent">
            on the map.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-[500px] text-sm leading-[1.7] text-[#8eaab9]">
          Join the business renaissance. Get discovered by people already
          looking to buy what you sell.
        </p>

        <Link
          href="/login"
          className="mx-auto mt-8 flex w-fit items-center gap-[9px] rounded-full border border-white/[0.13] bg-white/[0.06] px-7 py-[15px] text-[13px] font-bold text-white transition duration-[250ms] hover:-translate-y-0.5 hover:border-[rgba(34,211,238,0.4)] hover:bg-[rgba(34,211,238,0.1)] hover:shadow-[0_15px_35px_rgba(34,211,238,0.15)] max-landing-sm:px-5 max-landing-sm:py-3 max-landing-sm:text-[11px]"
        >
          Join MapAnytime
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
