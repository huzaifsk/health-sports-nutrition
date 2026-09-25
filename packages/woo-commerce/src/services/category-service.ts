import type { Category } from "@repo/types";
import type { CommerceAdapter } from "../adapter";

export class CategoryService {
  constructor(private adapter: CommerceAdapter) {}

  list(): Promise<Category[]> {
    return this.adapter.listCategories();
  }

  getBySlug(slug: string): Promise<Category | null> {
    return this.adapter.getCategoryBySlug(slug);
  }
}
