"use client";

import type { Product } from "@repo/types";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({
  product,
  variationId,
  quantity = 1,
  disabled,
  className,
  size = "default",
}: {
  product: Product;
  variationId: number | null;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: "default" | "lg" | "sm";
}) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      size={size}
      disabled={disabled || product.stockStatus === "outofstock"}
      className={className}
      onClick={() => {
        addItem(product, variationId, quantity);
        toast.success(`${product.name} added to cart`);
      }}
    >
      <ShoppingBag />
      {product.stockStatus === "outofstock" ? "Out of stock" : "Add to Cart"}
    </Button>
  );
}
