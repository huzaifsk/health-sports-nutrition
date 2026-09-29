import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  addItem,
  cartItemKey,
  createEmptyCart,
  removeItem,
  setCoupon,
  updateItemQuantity,
} from "./cart";
import { makeSimpleProduct, makeVariableProduct } from "./test-fixtures";

describe("createEmptyCart", () => {
  it("returns a cart with zeroed totals", () => {
    const cart = createEmptyCart();
    expect(cart.items).toEqual([]);
    expect(cart.couponCode).toBeNull();
    expect(cart.totals).toEqual({ subtotal: 0, discountTotal: 0, shippingTotal: 0, taxTotal: 0, total: 0 });
    expect(cart.currency).toBe("INR");
  });
});

describe("addItem — simple products", () => {
  it("adds a new line item with the product's price and stock", () => {
    const product = makeSimpleProduct();
    const cart = addItem(createEmptyCart(), product, null, 2);

    expect(cart.items).toHaveLength(1);
    const item = cart.items[0]!;
    expect(item.key).toBe(cartItemKey(product.id, null));
    expect(item.productId).toBe(product.id);
    expect(item.variationId).toBeNull();
    expect(item.quantity).toBe(2);
    expect(item.unitPrice).toBe(product.price);
    expect(item.sku).toBe(product.sku);
    expect(item.image).toBe(product.images[0]!.src);
    expect(item.maxQuantity).toBe(product.stockQuantity);
  });

  it("does nothing when quantity is less than 1", () => {
    const product = makeSimpleProduct();
    const cart = addItem(createEmptyCart(), product, null, 0);
    expect(cart.items).toHaveLength(0);
  });

  it("caps quantity at stock when adding a new item beyond stock", () => {
    const product = makeSimpleProduct({ stockQuantity: 3 });
    const cart = addItem(createEmptyCart(), product, null, 10);
    expect(cart.items[0]!.quantity).toBe(3);
  });

  it("caps cumulative quantity at stock when adding to an existing line", () => {
    const product = makeSimpleProduct({ stockQuantity: 5 });
    let cart = addItem(createEmptyCart(), product, null, 3);
    cart = addItem(cart, product, null, 4);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.quantity).toBe(5);
  });

  it("does not cap quantity when stock is unlimited (null)", () => {
    const product = makeSimpleProduct({ stockQuantity: null });
    const cart = addItem(createEmptyCart(), product, null, 999);
    expect(cart.items[0]!.quantity).toBe(999);
  });
});

describe("addItem — variable products", () => {
  it("resolves the selected variation's price, sku and attributes", () => {
    const product = makeVariableProduct();
    const cart = addItem(createEmptyCart(), product, 201, 1);

    expect(cart.items).toHaveLength(1);
    const item = cart.items[0]!;
    expect(item.key).toBe(cartItemKey(product.id, 201));
    expect(item.variationId).toBe(201);
    expect(item.unitPrice).toBe(1899);
    expect(item.sku).toBe("WP-VAR-CHOC-1KG");
    expect(item.attributes).toEqual({ flavor: "Chocolate" });
    expect(item.maxQuantity).toBe(3);
  });

  it("falls back to the parent product's image when the variation has none", () => {
    const product = makeVariableProduct();
    const cart = addItem(createEmptyCart(), product, 201, 1);
    expect(cart.items[0]!.image).toBe(product.images[0]!.src);
  });

  it("caps quantity at the variation's stock quantity", () => {
    const product = makeVariableProduct();
    const cart = addItem(createEmptyCart(), product, 201, 10);
    expect(cart.items[0]!.quantity).toBe(3);
  });

  it("returns the cart unchanged when no variationId is given", () => {
    const product = makeVariableProduct();
    const empty = createEmptyCart();
    const cart = addItem(empty, product, null, 1);
    expect(cart).toEqual(empty);
  });

  it("returns the cart unchanged when the variationId does not exist", () => {
    const product = makeVariableProduct();
    const empty = createEmptyCart();
    const cart = addItem(empty, product, 999, 1);
    expect(cart).toEqual(empty);
  });

  it("tracks out-of-stock variations as separate line items", () => {
    const product = makeVariableProduct();
    const cart = addItem(createEmptyCart(), product, 202, 1);
    expect(cart.items[0]!.stockStatus).toBe("outofstock");
  });
});

describe("updateItemQuantity", () => {
  it("updates the quantity of the matching line item", () => {
    const product = makeSimpleProduct({ stockQuantity: 10 });
    let cart = addItem(createEmptyCart(), product, null, 1);
    const key = cart.items[0]!.key;
    cart = updateItemQuantity(cart, key, 4);
    expect(cart.items[0]!.quantity).toBe(4);
  });

  it("caps the updated quantity at the item's maxQuantity", () => {
    const product = makeSimpleProduct({ stockQuantity: 5 });
    let cart = addItem(createEmptyCart(), product, null, 1);
    const key = cart.items[0]!.key;
    cart = updateItemQuantity(cart, key, 50);
    expect(cart.items[0]!.quantity).toBe(5);
  });

  it("removes the item when the new quantity is less than 1", () => {
    const product = makeSimpleProduct();
    let cart = addItem(createEmptyCart(), product, null, 1);
    const key = cart.items[0]!.key;
    cart = updateItemQuantity(cart, key, 0);
    expect(cart.items).toHaveLength(0);
  });

  it("is a no-op for a key that isn't in the cart", () => {
    const product = makeSimpleProduct();
    const cart = addItem(createEmptyCart(), product, null, 1);
    const next = updateItemQuantity(cart, "missing:0", 5);
    expect(next.items).toEqual(cart.items);
  });
});

describe("removeItem", () => {
  it("removes the matching line item and recomputes totals", () => {
    const product = makeSimpleProduct();
    let cart = addItem(createEmptyCart(), product, null, 2);
    const key = cart.items[0]!.key;
    cart = removeItem(cart, key);
    expect(cart.items).toHaveLength(0);
    expect(cart.totals.subtotal).toBe(0);
  });

  it("leaves other line items untouched", () => {
    const productA = makeSimpleProduct({ id: 1 });
    const productB = makeSimpleProduct({ id: 3, sku: "OTHER-SKU" });
    let cart = addItem(createEmptyCart(), productA, null, 1);
    cart = addItem(cart, productB, null, 1);
    cart = removeItem(cart, cartItemKey(1, null));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.productId).toBe(3);
  });
});

describe("setCoupon", () => {
  it("sets the coupon code and recomputes the discount", () => {
    const product = makeSimpleProduct({ price: 2000, stockQuantity: 10 });
    let cart = addItem(createEmptyCart(), product, null, 1);
    cart = setCoupon(cart, "FIRST20");
    expect(cart.couponCode).toBe("FIRST20");
    expect(cart.totals.discountTotal).toBe(400); // round(2000 * 0.2)
  });

  it("clears the discount when the coupon is cleared", () => {
    const product = makeSimpleProduct({ price: 2000, stockQuantity: 10 });
    let cart = addItem(createEmptyCart(), product, null, 1);
    cart = setCoupon(cart, "FIRST20");
    cart = setCoupon(cart, null);
    expect(cart.couponCode).toBeNull();
    expect(cart.totals.discountTotal).toBe(0);
  });
});

describe("free shipping threshold", () => {
  it("charges standard shipping below the free-shipping threshold", () => {
    const product = makeSimpleProduct({ price: 500, stockQuantity: 10 });
    const cart = addItem(createEmptyCart(), product, null, 1);
    expect(cart.totals.subtotal).toBeLessThan(FREE_SHIPPING_THRESHOLD);
    expect(cart.totals.shippingTotal).toBe(STANDARD_SHIPPING_FEE);
  });

  it("waives shipping at or above the free-shipping threshold", () => {
    const product = makeSimpleProduct({ price: FREE_SHIPPING_THRESHOLD, stockQuantity: 10 });
    const cart = addItem(createEmptyCart(), product, null, 1);
    expect(cart.totals.shippingTotal).toBe(0);
  });

  it("computes the threshold against the post-discount subtotal", () => {
    // Subtotal 2000 with a 20% ("FIRST20") coupon nets to 1600, which is below the
    // 1999 free-shipping threshold, so shipping should still be charged.
    const product = makeSimpleProduct({ price: 2000, stockQuantity: 10 });
    let cart = addItem(createEmptyCart(), product, null, 1);
    cart = setCoupon(cart, "FIRST20");
    expect(cart.totals.subtotal - cart.totals.discountTotal).toBeLessThan(FREE_SHIPPING_THRESHOLD);
    expect(cart.totals.shippingTotal).toBe(STANDARD_SHIPPING_FEE);
  });

  it("charges no shipping for an empty cart", () => {
    const cart = createEmptyCart();
    expect(cart.totals.shippingTotal).toBe(0);
  });
});

describe("cart totals math", () => {
  it("computes subtotal, discount and total across multiple line items", () => {
    const productA = makeSimpleProduct({ id: 1, price: 1000, stockQuantity: 10 });
    const productB = makeVariableProduct({ id: 2 });

    let cart = addItem(createEmptyCart(), productA, null, 2); // 2000
    cart = addItem(cart, productB, 201, 1); // + 1899
    cart = setCoupon(cart, "WELCOME10"); // flat 200 off, min order 1500

    const expectedSubtotal = 1000 * 2 + 1899;
    expect(cart.totals.subtotal).toBe(expectedSubtotal);
    expect(cart.totals.discountTotal).toBe(200);

    const taxable = expectedSubtotal - 200;
    const expectedShipping = taxable >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    expect(cart.totals.shippingTotal).toBe(expectedShipping);
    expect(cart.totals.taxTotal).toBe(0);
    expect(cart.totals.total).toBe(taxable + expectedShipping);
  });
});
