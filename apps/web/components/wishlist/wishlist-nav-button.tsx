"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/lib/wishlist-store";

export function WishlistNavButton() {
  const count = useWishlistStore((state) => state.items.length);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      nativeButton={false}
      render={<Link href="/wishlist" aria-label="View wishlist" />}
    >
      <Heart />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground tabular-nums">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
