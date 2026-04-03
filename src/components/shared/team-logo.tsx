import Image from "next/image";
import { Shield } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { container: string; icon: string; px: number }> = {
  xs: { container: "h-6 w-6", icon: "h-3 w-3", px: 24 },
  sm: { container: "h-8 w-8", icon: "h-4 w-4", px: 32 },
  md: { container: "h-10 w-10", icon: "h-5 w-5", px: 40 },
  lg: { container: "h-14 w-14", icon: "h-7 w-7", px: 56 },
  xl: { container: "h-20 w-20", icon: "h-10 w-10", px: 80 },
};

export function TeamLogo({
  logoUrl,
  teamName,
  size = "sm",
  className = "",
}: {
  logoUrl: string | null | undefined;
  teamName: string;
  size?: Size;
  className?: string;
}) {
  const s = sizeMap[size];

  if (logoUrl) {
    return (
      <div
        className={`${s.container} rounded-full overflow-hidden ring-1 ring-black/5 shrink-0 ${className}`}
      >
        <Image
          src={logoUrl}
          alt={teamName}
          width={s.px}
          height={s.px}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Fallback: colored circle with initials
  const initials = teamName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${s.container} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-1 ring-black/5 shrink-0 ${className}`}
      title={teamName}
    >
      <span className="font-bold text-gray-400" style={{ fontSize: s.px * 0.32 }}>
        {initials}
      </span>
    </div>
  );
}
