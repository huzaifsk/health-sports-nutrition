"use client";

import type { Product } from "@repo/types";
import { Heart } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { useIsWishlisted, useWishlistStore } from "@/lib/wishlist-store";

export function WishlistToggleButton({ product, className }: { product: Product; className?: string }) {
  const isWishlisted = useIsWishlisted(product.id);
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      onClick={() => toggle(product)}
    >
      <Heart className={cn("transition-colors", isWishlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}
