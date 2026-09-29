"use client";

import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.cart.items);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground">Add a product before checking out.</p>
        <Button nativeButton={false} render={<Link href="/products" />}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 font-heading text-2xl font-semibold tracking-tight">Checkout</h1>
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <CheckoutForm />
        <CheckoutSummary />
      </div>
    </div>
  );
}
