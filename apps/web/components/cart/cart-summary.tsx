"use client";

import { formatINR, FREE_SHIPPING_THRESHOLD } from "@repo/commerce";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";

export function CartSummary({ showCheckoutAction = true }: { showCheckoutAction?: boolean }) {
  const cart = useCartStore((state) => state.cart);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const [couponInput, setCouponInput] = useState(cart.couponCode ?? "");

  if (cart.items.length === 0) return null;

  const { subtotal, discountTotal, shippingTotal, total } = cart.totals;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discountTotal));

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex gap-2">
        <Input
          placeholder="Coupon code"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          className="h-9"
        />
        <Button
          variant="outline"
          onClick={() => applyCoupon(couponInput.trim() || null)}
          className="h-9"
        >
          Apply
        </Button>
      </div>
      {cart.couponCode && discountTotal === 0 && (
        <p className="text-xs text-destructive">
          &quot;{cart.couponCode}&quot; isn&apos;t valid for this order.
        </p>
      )}
      {remainingForFreeShipping > 0 ? (
        <p className="text-xs text-muted-foreground">
          Add {formatINR(remainingForFreeShipping)} more for free shipping.
        </p>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          You&apos;ve unlocked free shipping.
        </p>
      )}

      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatINR(subtotal)}</dd>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums text-destructive">-{formatINR(discountTotal)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">{shippingTotal === 0 ? "Free" : formatINR(shippingTotal)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatINR(total)}</dd>
        </div>
      </dl>

      {showCheckoutAction && (
        <Button
          size="lg"
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => toast("Checkout is coming in the next phase of this build.")}
        >
          Proceed to Checkout
        </Button>
      )}
    </div>
  );
}
