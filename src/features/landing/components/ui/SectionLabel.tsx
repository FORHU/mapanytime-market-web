import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-[0.18em] text-[#087d9a] ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
