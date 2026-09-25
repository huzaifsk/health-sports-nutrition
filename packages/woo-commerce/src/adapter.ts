import type { Category, Product, ProductFilters, ProductListResult } from "@repo/types";

/**
 * Everything above this interface (services, the commerce package, the app)
 * only ever talks to `CommerceAdapter`. Swapping the mock adapter for the
 * real WooCommerce REST adapter is a one-line change in `createAdapter()`.
 */
export interface CommerceAdapter {
  listProducts(filters: ProductFilters): Promise<ProductListResult>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
}
