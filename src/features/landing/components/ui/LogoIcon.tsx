import { MapPin } from "lucide-react";

interface LogoIconProps {
  iconSize?: number;
  className?: string;
}

export function LogoIcon({ iconSize = 17, className }: LogoIconProps) {
  return (
    <span
      className={`flex items-center justify-center rounded-[10px] bg-[#22d3ee] text-[#021521] shadow-[0_0_25px_rgba(34,211,238,0.35)] ${className ?? ""}`}
    >
      <MapPin size={iconSize} />
    </span>
  );
}
