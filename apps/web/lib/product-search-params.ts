import type { ProductFilters, ProductSort } from "@repo/types";

const SORTS: ProductSort[] = ["relevance", "price-asc", "price-desc", "newest", "rating", "best-selling"];

export type ProductSearchParams = Record<string, string | string[] | undefined>;

export function parseProductFilters(searchParams: ProductSearchParams): ProductFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const sort = get("sort");
  const page = Number(get("page"));
  const minPrice = Number(get("minPrice"));
  const maxPrice = Number(get("maxPrice"));

  return {
    search: get("q") || undefined,
    categorySlug: get("category") || undefined,
    sort: sort && (SORTS as string[]).includes(sort) ? (sort as ProductSort) : "relevance",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    inStockOnly: get("inStock") === "1",
    perPage: 12,
  };
}
