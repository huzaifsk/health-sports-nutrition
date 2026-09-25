/** Minimal shape of the WooCommerce REST API v3 responses we actually read. */

export interface WCImage {
  id: number;
  src: string;
  alt: string;
}

export interface WCCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface WCCategory extends WCCategoryRef {
  description: string;
  image: WCImage | null;
  count: number;
}

export interface WCAttribute {
  id: number;
  name: string;
  slug?: string;
  variation: boolean;
  options: string[];
}

export interface WCMetaData {
  key: string;
  value: unknown;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  average_rating: string;
  rating_count: number;
  categories: WCCategoryRef[];
  images: WCImage[];
  attributes: WCAttribute[];
  variations: number[];
  tags: { id: number; name: string; slug: string }[];
  date_created: string;
  meta_data: WCMetaData[];
}

export interface WCVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  weight: string;
  image: WCImage | null;
  attributes: { id: number; name: string; option: string }[];
}
