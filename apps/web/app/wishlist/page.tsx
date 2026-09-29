"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { ProductVisual } from "@/components/product/product-visual";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/lib/wishlist-store";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const remove = useWishlistStore((state) => state.remove);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 font-heading text-2xl font-semibold tracking-tight">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">Nothing saved yet — tap the heart on any product to add it here.</p>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Browse Products
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.productId} className="flex flex-col gap-2">
              <div className="relative">
                <Link href={`/products/${item.slug}`} className="block aspect-square overflow-hidden rounded-xl">
                  <ProductVisual
                    categorySlug={item.categorySlug ?? undefined}
                    imageSrc={item.image}
                    imageAlt={item.name}
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="size-full"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 rounded-full bg-background/90 backdrop-blur-sm"
                  onClick={() => remove(item.productId)}
                >
                  <X />
                </Button>
              </div>
              <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
