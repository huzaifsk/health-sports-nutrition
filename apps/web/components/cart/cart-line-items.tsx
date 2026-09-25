"use client";

import { formatINR } from "@repo/commerce";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

export function CartLineItems() {
  const items = useCartStore((state) => state.cart.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="font-heading text-sm font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Add a product to get started.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li key={item.key} className="flex gap-3 py-4">
          <Link
            href={`/products/${item.slug}`}
            className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {item.image && (
              <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
            )}
          </Link>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/products/${item.slug}`} className="text-sm font-medium leading-snug hover:underline">
                {item.name}
              </Link>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${item.name} from cart`}
              >
                <X className="size-3.5" />
              </button>
            </div>
            {Object.keys(item.attributes).length > 0 && (
              <p className="text-xs text-muted-foreground">
                {Object.values(item.attributes).join(" / ")}
              </p>
            )}
            {item.stockStatus !== "instock" && (
              <p className="text-xs text-destructive">Out of stock</p>
            )}
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center rounded-full border border-border">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </Button>
                <span className="w-5 text-center text-xs tabular-nums">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {formatINR(item.unitPrice * item.quantity)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
