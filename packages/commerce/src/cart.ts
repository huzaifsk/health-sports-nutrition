import type { Cart, CartItem, CartTotals, Product } from "@repo/types";
import { applyCoupon } from "./coupons";

export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING_FEE = 99;

export function createEmptyCart(): Cart {
  return {
    items: [],
    couponCode: null,
    totals: { subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, total: 0 },
    currency: "INR",
  };
}

export function cartItemKey(productId: number, variationId: number | null): string {
  return `${productId}:${variationId ?? 0}`;
}

/** Resolves the sellable line (price, stock, image, sku) for a product + optional variant selection. */
export function resolveSelection(
  product: Product,
  variationId: number | null,
): Omit<CartItem, "key" | "quantity"> | null {
  if (product.type === "variable") {
    if (variationId === null) return null;
    const variation = product.variations.find((v) => v.id === variationId);
    if (!variation) return null;
    return {
      productId: product.id,
      variationId: variation.id,
      slug: product.slug,
      name: product.name,
      image: variation.image?.src ?? product.images[0]?.src ?? null,
      sku: variation.sku,
      attributes: variation.attributes,
      unitPrice: variation.price,
      stockStatus: variation.stockStatus,
      maxQuantity: variation.stockQuantity,
    };
  }

  return {
    productId: product.id,
    variationId: null,
    slug: product.slug,
    name: product.name,
    image: product.images[0]?.src ?? null,
    sku: product.sku,
    attributes: {},
    unitPrice: product.price,
    stockStatus: product.stockStatus,
    maxQuantity: product.stockQuantity,
  };
}

function computeTotals(items: CartItem[], couponCode: string | null): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountTotal = applyCoupon(subtotal, couponCode);
  const taxableSubtotal = subtotal - discountTotal;
  const shippingTotal = items.length === 0 || taxableSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const taxTotal = 0; // MRP is tax-inclusive.
  return {
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    total: taxableSubtotal + shippingTotal + taxTotal,
  };
}

function withRecomputedTotals(items: CartItem[], couponCode: string | null): Cart {
  return { items, couponCode, totals: computeTotals(items, couponCode), currency: "INR" };
}

export function addItem(cart: Cart, product: Product, variationId: number | null, quantity: number): Cart {
  const selection = resolveSelection(product, variationId);
  if (!selection || quantity < 1) return cart;

  const key = cartItemKey(product.id, variationId);
  const existing = cart.items.find((i) => i.key === key);

  let items: CartItem[];
  if (existing) {
    const nextQuantity = existing.maxQuantity
      ? Math.min(existing.quantity + quantity, existing.maxQuantity)
      : existing.quantity + quantity;
    items = cart.items.map((i) => (i.key === key ? { ...i, quantity: nextQuantity } : i));
  } else {
    const cappedQuantity = selection.maxQuantity ? Math.min(quantity, selection.maxQuantity) : quantity;
    items = [...cart.items, { ...selection, key, quantity: cappedQuantity }];
  }

  return withRecomputedTotals(items, cart.couponCode);
}

export function updateItemQuantity(cart: Cart, key: string, quantity: number): Cart {
  if (quantity < 1) return removeItem(cart, key);
  const items = cart.items.map((i) =>
    i.key === key ? { ...i, quantity: i.maxQuantity ? Math.min(quantity, i.maxQuantity) : quantity } : i,
  );
  return withRecomputedTotals(items, cart.couponCode);
}

export function removeItem(cart: Cart, key: string): Cart {
  return withRecomputedTotals(
    cart.items.filter((i) => i.key !== key),
    cart.couponCode,
  );
}

export function setCoupon(cart: Cart, code: string | null): Cart {
  return withRecomputedTotals(cart.items, code);
}
