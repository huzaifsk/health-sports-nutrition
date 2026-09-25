import { formatINR, productService } from "@repo/commerce";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductVisual } from "@/components/product/product-visual";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const featured = await productService.listFeatured(2);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <span
            className="w-fit animate-in fade-in slide-in-from-bottom-2 rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground duration-700"
            style={{ animationFillMode: "backwards" }}
          >
            New: Peak Isolate Protein
          </span>
          <h1
            className="animate-in fade-in slide-in-from-bottom-2 font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance duration-700 sm:text-6xl"
            style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
          >
            Premium protein.
            <br />
            Built for your <span className="text-success text-nowrap">next level</span>.
          </h1>
          <p
            className="max-w-md animate-in fade-in slide-in-from-bottom-2 text-muted-foreground duration-700"
            style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
          >
            Third-party tested whey, isolate, plant protein and performance essentials —
            formulated for people who train hard and expect more from their supplements.
          </p>
          <div
            className="flex animate-in fade-in slide-in-from-bottom-2 flex-wrap gap-3 duration-700"
            style={{ animationDelay: "240ms", animationFillMode: "backwards" }}
          >
            <Button
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Shop Protein
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/products?sort=rating" />}>
              Explore Best Sellers
            </Button>
          </div>
          <div
            className="flex animate-in fade-in items-center gap-3 text-sm text-muted-foreground duration-700"
            style={{ animationDelay: "320ms", animationFillMode: "backwards" }}
          >
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </div>
            <span>4.7 average across 3,000+ reviews</span>
          </div>
        </div>

        <div
          className="relative aspect-4/3 animate-in fade-in zoom-in-95 duration-700 md:aspect-3/2"
          style={{ animationDelay: "120ms", animationFillMode: "backwards" }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-neutral-900">
            {featured[0]?.images[0] && (
              <Image
                src={featured[0].images[0].src}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover opacity-95"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-transparent to-neutral-950/20" />
          </div>

          {featured[0] && (
            <div className="absolute top-[8%] left-[6%] flex w-44 items-center gap-2.5 rounded-2xl bg-popover/95 p-2.5 shadow-lg ring-1 ring-foreground/10 backdrop-blur-sm">
              <ProductVisual
                categorySlug={featured[0].categories[0]?.slug}
                imageSrc={featured[0].images[0]?.src}
                imageAlt={featured[0].name}
                sizes="44px"
                className="size-11 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{featured[0].name}</p>
                <p className="text-xs text-muted-foreground">{formatINR(featured[0].price)}</p>
              </div>
            </div>
          )}

          {featured[1] && (
            <div className="absolute right-[6%] bottom-[10%] flex w-44 items-center gap-2.5 rounded-2xl bg-popover/95 p-2.5 shadow-lg ring-1 ring-foreground/10 backdrop-blur-sm">
              <ProductVisual
                categorySlug={featured[1].categories[0]?.slug}
                imageSrc={featured[1].images[0]?.src}
                imageAlt={featured[1].name}
                sizes="44px"
                className="size-11 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{featured[1].name}</p>
                <p className="text-xs text-muted-foreground">{formatINR(featured[1].price)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
