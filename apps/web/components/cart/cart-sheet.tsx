"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartCount, useCartStore } from "@/lib/cart-store";
import { CartLineItems } from "./cart-line-items";
import { CartSummary } from "./cart-summary";

export function CartButton() {
  const count = useCartCount();
  const openCart = useCartStore((state) => state.openCart);

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label="Open cart">
      <ShoppingBag />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground tabular-nums">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}

export function CartSheet() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.cart.items);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <CartLineItems />
        </div>
        {items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border px-4 pb-4">
            <CartSummary showCheckoutAction={false} />
            <Button
              size="lg"
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              nativeButton={false}
              render={<Link href="/cart" onClick={closeCart} />}
            >
              View Cart & Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
