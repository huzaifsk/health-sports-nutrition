import type { Product } from "@repo/types";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { PriceTag } from "@/components/product/price-tag";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-3 block aspect-square overflow-hidden rounded-xl bg-muted"
      >
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        )}
        {product.onSale && (
          <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-brand-foreground">
            Sale
          </span>
        )}
      </Link>

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
