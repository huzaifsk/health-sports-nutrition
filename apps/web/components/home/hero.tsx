import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
            New: Peak Isolate Protein
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Premium protein.
            <br />
            Built for your next level.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Third-party tested whey, isolate, plant protein and performance essentials —
            formulated for people who train hard and expect more from their supplements.
          </p>
          <div className="flex flex-wrap gap-3">
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
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl md:aspect-4/5">
          <Image
            src="https://picsum.photos/seed/hero-protein/1200/1500"
            alt="PeakProtein hero product"
            fill
            priority
            sizes="(min-width: 768px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
