import type { Product, ProductFilters, ProductListResult } from "@repo/types";
import type { CommerceAdapter } from "../adapter";

export class ProductService {
  constructor(private adapter: CommerceAdapter) {}

  list(filters: ProductFilters = {}): Promise<ProductListResult> {
    return this.adapter.listProducts(filters);
  }

  getBySlug(slug: string): Promise<Product | null> {
    return this.adapter.getProductBySlug(slug);
  }

  async listFeatured(limit = 8): Promise<Product[]> {
    const { items } = await this.adapter.listProducts({ perPage: 50 });
    return items.filter((p) => p.featured).slice(0, limit);
  }
}
