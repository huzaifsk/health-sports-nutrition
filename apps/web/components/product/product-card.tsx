import type { Product } from "@repo/types";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { PriceTag } from "@/components/product/price-tag";
import { ProductVisual } from "@/components/product/product-visual";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col">
      <div className="relative mb-3">
        <Link href={`/products/${product.slug}`} className="block aspect-square overflow-hidden rounded-xl">
          <ProductVisual
            categorySlug={product.categories[0]?.slug}
            imageSrc={product.images[0]?.src}
            imageAlt={product.images[0]?.alt ?? product.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="size-full"
          />
          {product.onSale && (
            <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground">
              Sale
            </span>
          )}
        </Link>
        <WishlistToggleButton
          product={product}
          className="absolute top-2 right-2 rounded-full border-none bg-background/90 backdrop-blur-sm"
        />
      </div>

      <Link href={`/products/${product.slug}`} className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{product.categories[0]?.name}</span>
        <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
      </Link>
      <RatingStars rating={product.averageRating} count={product.ratingCount} className="mt-1" />
      <PriceTag price={product.price} regularPrice={product.regularPrice} className="mt-1.5" />

      <div className="mt-3">
        {product.type === "variable" ? (
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href={`/products/${product.slug}`} />}
          >
            Select Options
          </Button>
        ) : (
          <AddToCartButton product={product} variationId={null} className="w-full" />
        )}
      </div>
    </div>
  );
}
