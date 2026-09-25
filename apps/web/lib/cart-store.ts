"use client";

import {
  addItem as addItemToCart,
  createEmptyCart,
  removeItem as removeItemFromCart,
  setCoupon as setCartCoupon,
  updateItemQuantity,
} from "@repo/commerce";
import type { Cart, Product } from "@repo/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  cart: Cart;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variationId: number | null, quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  applyCoupon: (code: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (product, variationId, quantity) =>
        set({ cart: addItemToCart(get().cart, product, variationId, quantity), isOpen: true }),
      updateQuantity: (key, quantity) => set({ cart: updateItemQuantity(get().cart, key, quantity) }),
      removeItem: (key) => set({ cart: removeItemFromCart(get().cart, key) }),
      applyCoupon: (code) => set({ cart: setCartCoupon(get().cart, code) }),
    }),
    {
      name: "peakprotein-cart",
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);

export function useCartCount() {
  return useCartStore((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
}
