"use client";

import type { Category } from "@repo/types";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";

export function ProductFiltersMobile({ categories }: { categories: Category[] }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="md:hidden">
            <SlidersHorizontal />
            Filters
          </Button>
        }
      />
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <ProductFilters categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
