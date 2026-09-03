import clsx from "clsx";

const stats = [
  { value: "450M+", label: "offline small businesses" },
  { value: "30 sec", label: "AI listing time" },
  { value: "3–5%", label: "merchant transaction fee" },
  { value: "0", label: "delivery drivers required" },
];

export function LandingStats() {
  return (
    <div className="relative z-[5] mx-auto mt-[90px] grid w-full max-w-[1200px] grid-cols-4 overflow-hidden rounded-[19px] border border-white/[0.08] bg-white/[0.035] backdrop-blur-[12px] max-landing-sm:mt-[65px] max-landing-sm:grid-cols-2">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={clsx(
            "border-r border-white/[0.07] p-[21px] text-center",
            i === 3 && "border-r-0",
            i === 1 && "max-landing-sm:border-r-0",
            i === 3 && "max-landing-sm:border-r-0",
            i < 2 &&
              "max-landing-sm:border-b max-landing-sm:border-b-white/[0.07]",
            i >= 2 && "max-landing-sm:border-b-0",
          )}
        >
          <strong className="block text-[20px] tracking-[-0.03em] text-white">
            {stat.value}
          </strong>
          <span className="mt-1 block text-[9px] text-[#617e8c]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
