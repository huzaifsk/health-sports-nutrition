import { discountPercent, formatINR } from "@repo/commerce";
import { cn } from "cn";

export function PriceTag({
  price,
  regularPrice,
  size = "default",
  className,
}: {
  price: number;
  regularPrice: number;
  size?: "default" | "lg";
  className?: string;
}) {
  const percentOff = discountPercent(regularPrice, price);

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-medium tabular-nums", size === "lg" ? "text-2xl" : "text-sm")}>
        {formatINR(price)}
      </span>
      {percentOff > 0 && (
        <>
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            {formatINR(regularPrice)}
          </span>
          <span className="text-xs font-medium text-success">{percentOff}% off</span>
        </>
      )}
    </div>
  );
}
