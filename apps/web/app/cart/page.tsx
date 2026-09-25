"use client";

import Link from "next/link";
import { CartLineItems } from "@/components/cart/cart-line-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.cart.items);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 font-heading text-2xl font-semibold tracking-tight">Your Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-[1fr_320px]">
          <CartLineItems />
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
