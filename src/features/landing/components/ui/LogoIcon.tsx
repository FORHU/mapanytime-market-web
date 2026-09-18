import Image from "next/image";

interface LogoIconProps {
  iconSize?: number;
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-[8px] ${className ?? "h-[31px] w-[31px]"}`}
    >
      <Image
        src="/logo.png"
        alt="MapAnytime"
        width={40}
        height={40}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}
