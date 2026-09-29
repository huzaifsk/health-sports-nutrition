"use client";

import type { Product, WishlistItem } from "@repo/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: WishlistItem[];
  toggle: (product: Product) => void;
  remove: (productId: number) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === product.id);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== product.id) };
          }
          const item: WishlistItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0]?.src ?? null,
            categorySlug: product.categories[0]?.slug ?? null,
            addedAt: new Date().toISOString(),
          };
          return { items: [item, ...state.items] };
        }),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
    }),
    { name: "peakprotein-wishlist" },
  ),
);

export function useIsWishlisted(productId: number) {
  return useWishlistStore((state) => state.items.some((i) => i.productId === productId));
}
