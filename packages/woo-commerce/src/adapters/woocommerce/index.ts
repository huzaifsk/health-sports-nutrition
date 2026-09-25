import type { Category, Product, ProductFilters, ProductListResult } from "@repo/types";
import type { CommerceAdapter } from "../../adapter";
import { createWooCommerceClient, type WooCommerceCredentials } from "../../client";
import { mapCategory, mapProduct, mapVariation } from "./mappers";
import type { WCCategory, WCProduct, WCVariation } from "./wc-types";

const sortToWcParams: Record<
  NonNullable<ProductFilters["sort"]>,
  { orderby: string; order: "asc" | "desc" }
> = {
  relevance: { orderby: "menu_order", order: "asc" },
  "price-asc": { orderby: "price", order: "asc" },
  "price-desc": { orderby: "price", order: "desc" },
  newest: { orderby: "date", order: "desc" },
  rating: { orderby: "rating", order: "desc" },
  "best-selling": { orderby: "popularity", order: "desc" },
};

/**
 * Real WooCommerce REST API adapter. Only instantiated when WC_URL /
 * WC_CONSUMER_KEY / WC_CONSUMER_SECRET are configured - see
 * `createCommerceAdapter()` in `../../index.ts`.
 */
export class WooCommerceAdapter implements CommerceAdapter {
  private client: ReturnType<typeof createWooCommerceClient>;
  private categorySlugToId = new Map<string, number>();

  constructor(credentials: WooCommerceCredentials) {
    this.client = createWooCommerceClient(credentials);
  }

  private async resolveCategoryId(slug: string): Promise<number | null> {
    if (this.categorySlugToId.has(slug)) return this.categorySlugToId.get(slug)!;
    const { data } = await this.client.get("products/categories", { slug });
    const match = (data as WCCategory[])[0];
    if (!match) return null;
    this.categorySlugToId.set(slug, match.id);
    return match.id;
  }

  private async fetchVariations(productId: number) {
    const { data } = await this.client.get(`products/${productId}/variations`, { per_page: 100 });
    return (data as WCVariation[]).map(mapVariation);
  }

  async listProducts(filters: ProductFilters): Promise<ProductListResult> {
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 12;
    const { orderby, order } = sortToWcParams[filters.sort ?? "relevance"];

    const params: Record<string, unknown> = {
      page,
      per_page: perPage,
      orderby,
      order,
      status: "publish",
    };
    if (filters.search) params.search = filters.search;
    if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
    if (filters.inStockOnly) params.stock_status = "instock";
    if (filters.categorySlug) {
      const categoryId = await this.resolveCategoryId(filters.categorySlug);
      if (categoryId === null) {
        return { items: [], total: 0, page, perPage, totalPages: 1 };
      }
      params.category = categoryId;
    }

    const response = await this.client.get("products", params);
    const wcProducts = response.data as WCProduct[];
    const total = Number(response.headers["x-wp-total"] ?? wcProducts.length);
    const totalPages = Number(response.headers["x-wp-totalpages"] ?? 1);

    const items = await Promise.all(
      wcProducts.map(async (wc) => {
        const variations = wc.type === "variable" ? await this.fetchVariations(wc.id) : [];
        return mapProduct(wc, variations);
      }),
    );

    return { items, total, page, perPage, totalPages };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data } = await this.client.get("products", { slug });
    const wc = (data as WCProduct[])[0];
    if (!wc) return null;
    const variations = wc.type === "variable" ? await this.fetchVariations(wc.id) : [];
    return mapProduct(wc, variations);
  }

  async listCategories(): Promise<Category[]> {
    const { data } = await this.client.get("products/categories", { per_page: 100, hide_empty: true });
    return (data as WCCategory[]).map(mapCategory);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data } = await this.client.get("products/categories", { slug });
    const wc = (data as WCCategory[])[0];
    return wc ? mapCategory(wc) : null;
  }
}
