import { Droplets, Flame, Leaf, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "cn";

interface CategoryStyle {
  tint: string;
  icon: LucideIcon;
  iconColor: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "whey-protein": { tint: "from-emerald-50 to-teal-100", icon: Zap, iconColor: "text-emerald-600" },
  "protein-isolate": { tint: "from-sky-50 to-blue-100", icon: Droplets, iconColor: "text-sky-600" },
  "plant-protein": { tint: "from-lime-50 to-green-100", icon: Leaf, iconColor: "text-green-600" },
  creatine: { tint: "from-violet-50 to-purple-100", icon: Zap, iconColor: "text-violet-600" },
  "mass-gainer": { tint: "from-amber-50 to-orange-100", icon: TrendingUp, iconColor: "text-orange-600" },
  "pre-workout": { tint: "from-rose-50 to-red-100", icon: Flame, iconColor: "text-red-600" },
};

const FALLBACK: CategoryStyle = {
  tint: "from-neutral-50 to-neutral-100",
  icon: Zap,
  iconColor: "text-neutral-400",
};

export function ProductVisual({
  categorySlug,
  imageSrc,
  imageAlt,
  label,
  className,
  sizes = "400px",
  priority,
}: {
  categorySlug?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { tint, icon: Icon, iconColor } = (categorySlug && CATEGORY_STYLES[categorySlug]) || FALLBACK;

  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-linear-to-br",
        tint,
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      ) : (
        <Icon className={cn("size-8", iconColor)} strokeWidth={1.5} />
      )}
      {label && (
        <span className="absolute bottom-2 left-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-medium text-background backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
