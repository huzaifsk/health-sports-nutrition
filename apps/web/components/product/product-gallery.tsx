"use client";

import type { ProductImage } from "@repo/types";
import Image from "next/image";
import { useState } from "react";
import { cn } from "cn";

export function ProductGallery({ images, activeImage }: { images: ProductImage[]; activeImage?: string | null }) {
  const [selected, setSelected] = useState(0);
  const main = activeImage ? { src: activeImage, alt: images[0]?.alt ?? "" } : images[selected];

  if (!main) return <div className="aspect-square rounded-2xl bg-muted" />;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image src={main.src} alt={main.alt} fill priority sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-transparent transition-all",
                !activeImage && selected === index && "ring-2 ring-foreground",
              )}
            >
              <Image src={image.src} alt={image.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
