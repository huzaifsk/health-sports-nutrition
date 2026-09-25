import { categoryService, productService } from "@repo/commerce";
import type { Metadata } from "next";
import { ProductFiltersMobile } from "@/components/product/product-filters-mobile";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/pagination";
import { SortSelect } from "@/components/product/sort-select";
import { parseProductFilters, type ProductSearchParams } from "@/lib/product-search-params";

export const metadata: Metadata = {
  title: "Shop All Products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProductFilters(resolvedSearchParams);

  const [{ items, total, page, totalPages }, categories] = await Promise.all([
    productService.list(filters),
    categoryService.list(),
  ]);

  const activeCategory = categories.find((c) => c.slug === filters.categorySlug);
  const heading = filters.search
    ? `Results for "${filters.search}"`
    : (activeCategory?.name ?? "All Products");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProductFiltersMobile categories={categories} />
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <aside className="hidden md:block">
          <ProductFilters categories={categories} />
        </aside>
        <div>
          <ProductGrid products={items} />
          <ProductPagination page={page} totalPages={totalPages} searchParams={resolvedSearchParams} />
        </div>
      </div>
    </div>
  );
}
