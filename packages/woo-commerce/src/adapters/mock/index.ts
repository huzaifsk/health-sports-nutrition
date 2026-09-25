import type { Category, Product, ProductFilters, ProductListResult } from "@repo/types";
import type { CommerceAdapter } from "../../adapter";
import { mockCategories, products } from "./data";

function matchesFilters(product: Product, filters: ProductFilters): boolean {
  if (filters.categorySlug && !product.categories.some((c) => c.slug === filters.categorySlug)) {
    return false;
  }
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = `${product.name} ${product.shortDescription}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
  if (filters.inStockOnly && product.stockStatus !== "instock") return false;
  return true;
}

function sortProducts(items: Product[], sort: ProductFilters["sort"]): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "rating":
      return sorted.sort((a, b) => b.averageRating - a.averageRating);
    case "best-selling":
      return sorted.sort((a, b) => b.ratingCount - a.ratingCount);
    case "relevance":
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export class MockCommerceAdapter implements CommerceAdapter {
  async listProducts(filters: ProductFilters): Promise<ProductListResult> {
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 12;

    const filtered = products.filter((p) => matchesFilters(p, filters));
    const sorted = sortProducts(filtered, filters.sort);

    const start = (page - 1) * perPage;
    const items = sorted.slice(start, start + perPage);

    return {
      items,
      total: filtered.length,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  }

  async listCategories(): Promise<Category[]> {
    return mockCategories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return mockCategories.find((c) => c.slug === slug) ?? null;
  }
}
