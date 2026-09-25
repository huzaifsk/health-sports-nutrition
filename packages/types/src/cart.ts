export interface CartItem {
  /** Unique per line: `${productId}:${variationId ?? 0}` */
  key: string;
  productId: number;
  variationId: number | null;
  slug: string;
  name: string;
  image: string | null;
  categorySlug: string | null;
  sku: string;
  attributes: Record<string, string>;
  quantity: number;
  unitPrice: number;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  maxQuantity: number | null;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  couponCode: string | null;
  totals: CartTotals;
  currency: "INR";
}
