import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  submitted: boolean;
  children: ReactNode;
}

export function PrimaryButton({ submitted, children }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      className="relative h-[53px] flex shrink-0 items-center justify-center gap-[9px] overflow-hidden rounded-full border-0 bg-gradient-to-br from-[#ff9a5b] to-[#ff5f6d] px-[21px] text-xs font-extrabold text-[#210d07] shadow-[0_12px_35px_rgba(255,95,109,0.24)] transition duration-[250ms] hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_17px_40px_rgba(255,95,109,0.34)]"
    >
      <span>{children}</span>
      {submitted ? <Check size={17} /> : <ArrowRight size={17} />}
    </button>
  );
}
