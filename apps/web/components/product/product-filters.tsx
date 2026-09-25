"use client";

import type { Category } from "@repo/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const inStockOnly = searchParams.get("inStock") === "1";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleCategory(slug: string) {
    updateParams((params) => {
      if (activeCategory === slug) params.delete("category");
      else params.set("category", slug);
    });
  }

  function toggleInStock(checked: boolean) {
    updateParams((params) => {
      if (checked) params.set("inStock", "1");
      else params.delete("inStock");
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  const hasActiveFilters = Boolean(activeCategory || inStockOnly || minPrice || maxPrice);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Category</h3>
        <ul className="flex flex-col gap-1">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => toggleCategory(category.slug)}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  activeCategory === category.slug && "bg-muted font-medium text-foreground",
                )}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Price (₹)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-8"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            className="h-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={(checked) => toggleInStock(checked === true)} />
        <Label htmlFor="in-stock" className="text-sm font-normal">
          In stock only
        </Label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            router.push(pathname, { scroll: false });
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
