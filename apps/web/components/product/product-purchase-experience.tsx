"use client";

import type { Product, ProductVariation } from "@repo/types";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { PriceTag } from "@/components/product/price-tag";
import { ProductGallery } from "@/components/product/product-gallery";
import { RatingStars } from "@/components/product/rating-stars";
import { StockBadge } from "@/components/product/stock-badge";
import { Button } from "@/components/ui/button";

function findVariation(variations: ProductVariation[], selection: Record<string, string>) {
  return variations.find((variation) =>
    Object.entries(selection).every(([key, value]) => variation.attributes[key] === value),
  );
}

export function ProductPurchaseExperience({ product }: { product: Product }) {
  const isVariable = product.type === "variable";

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (!isVariable) return {};
    const initial: Record<string, string> = {};
    for (const attribute of product.attributes) {
      initial[attribute.name] = attribute.options[0]!;
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);

  const selectedVariation = useMemo(
    () => (isVariable ? findVariation(product.variations, selection) : undefined),
    [isVariable, product.variations, selection],
  );

  const price = selectedVariation?.price ?? product.price;
  const regularPrice = selectedVariation?.regularPrice ?? product.regularPrice;
  const stockStatus = selectedVariation?.stockStatus ?? product.stockStatus;
  const stockQuantity = selectedVariation?.stockQuantity ?? product.stockQuantity;
  const maxQuantity = stockQuantity ?? undefined;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <ProductGallery images={product.images} activeImage={selectedVariation?.image?.src ?? null} />

      <div className="flex flex-col gap-4">
        <div>
          <span className="text-sm text-muted-foreground">{product.categories[0]?.name}</span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{product.name}</h1>
        </div>
        <RatingStars rating={product.averageRating} count={product.ratingCount} />
        <PriceTag price={price} regularPrice={regularPrice} size="lg" />
        <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
        <StockBadge status={stockStatus} quantity={stockQuantity} />

        {isVariable &&
          product.attributes.map((attribute) => (
            <div key={attribute.id}>
              <h3 className="mb-2 text-sm font-medium">{attribute.name}</h3>
              <div className="flex flex-wrap gap-2">
                {attribute.options.map((option) => {
                  const isSelected = selection[attribute.name] === option;
                  const wouldBeSelection = { ...selection, [attribute.name]: option };
                  const matched = findVariation(product.variations, wouldBeSelection);
                  const isAvailable = matched ? matched.stockStatus !== "outofstock" : true;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelection((prev) => ({ ...prev, [attribute.name]: option }))}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={() => setQuantity((q) => (maxQuantity ? Math.min(maxQuantity, q + 1) : q + 1))}
              disabled={maxQuantity !== undefined && quantity >= maxQuantity}
              aria-label="Increase quantity"
            >
              <Plus />
            </Button>
          </div>
          <AddToCartButton
            product={product}
            variationId={selectedVariation?.id ?? null}
            quantity={quantity}
            size="lg"
            className="flex-1"
            disabled={isVariable && !selectedVariation}
          />
        </div>
      </div>
    </div>
  );
}
