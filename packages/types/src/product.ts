export type StockStatus = "instock" | "outofstock" | "onbackorder";

export type ProductType = "simple" | "variable";

export interface ProductCategoryRef {
  id: number;
  slug: string;
  name: string;
}

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  /** Options exposed at the parent-product level, used to build variant pickers. */
  options: string[];
  variation: boolean;
}

export interface ProductVariation {
  id: number;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  stockStatus: StockStatus;
  stockQuantity: number | null;
  weightGrams: number;
  image: ProductImage | null;
  /** e.g. { flavor: "Chocolate", size: "1kg" } */
  attributes: Record<string, string>;
}

export interface NutritionFacts {
  servingSizeGrams: number;
  servingsPerContainer: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sugarGrams: number;
  ingredients: string;
  allergens: string[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  type: ProductType;
  status: "publish" | "draft";
  featured: boolean;
  shortDescription: string;
  description: string;
  sku: string;
  currency: "INR";
  price: number;
  regularPrice: number;
  salePrice: number | null;
  onSale: boolean;
  stockStatus: StockStatus;
  stockQuantity: number | null;
  averageRating: number;
  ratingCount: number;
  categories: ProductCategoryRef[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  nutrition: NutritionFacts | null;
  usageInstructions: string | null;
  storageInstructions: string | null;
  tags: string[];
  createdAt: string;
}

export type ProductSort =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "best-selling";

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
