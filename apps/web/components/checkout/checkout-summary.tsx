"use client";

import { formatINR } from "@repo/commerce";
import Link from "next/link";
import { ProductVisual } from "@/components/product/product-visual";
import { useCartStore } from "@/lib/cart-store";

export function CheckoutSummary() {
  const cart = useCartStore((state) => state.cart);
  const { subtotal, discountTotal, shippingTotal, total } = cart.totals;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Order Summary</h2>
        <Link href="/cart" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Edit cart
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {cart.items.map((item) => (
          <li key={item.key} className="flex gap-3">
            <div className="relative shrink-0">
              <ProductVisual
                categorySlug={item.categorySlug ?? undefined}
                imageSrc={item.image}
                imageAlt={item.name}
                sizes="48px"
                className="size-12 rounded-lg"
              />
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm leading-snug font-medium">{item.name}</p>
              {Object.keys(item.attributes).length > 0 && (
                <p className="text-xs text-muted-foreground">{Object.values(item.attributes).join(" / ")}</p>
              )}
            </div>
            <span className="text-sm tabular-nums">{formatINR(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatINR(subtotal)}</dd>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount{cart.couponCode ? ` (${cart.couponCode})` : ""}</dt>
            <dd className="tabular-nums text-success">-{formatINR(discountTotal)}</dd>
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
    </div>
  );
}
