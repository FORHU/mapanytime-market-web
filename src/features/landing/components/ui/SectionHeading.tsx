import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";

interface SectionHeadingProps {
  label: string;
  title: ReactNode;
  description?: string;
}

export function SectionHeading({
  label,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto w-full max-w-[700px] text-center">
      <SectionLabel>{label}</SectionLabel>

      <h2 className="mt-4 text-[clamp(38px,5vw,57px)] leading-[0.96] tracking-[-0.055em] [&_em]:not-italic [&_em]:text-[#0788a7]">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-5 max-w-[500px] text-sm leading-[1.7] text-[#718894]">
          {description}
        </p>
      )}
    </div>
  );
}
