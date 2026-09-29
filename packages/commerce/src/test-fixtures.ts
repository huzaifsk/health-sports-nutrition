import type { Product, ProductVariation } from "@repo/types";

/** A simple (non-variable) in-stock product with limited stock, used across cart tests. */
export function makeSimpleProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "whey-protein-chocolate",
    name: "Whey Protein — Chocolate",
    type: "simple",
    status: "publish",
    featured: false,
    shortDescription: "Chocolate whey protein, 1kg.",
    description: "Full description of chocolate whey protein.",
    sku: "WP-CHOC-1KG",
    currency: "INR",
    price: 1999,
    regularPrice: 2499,
    salePrice: 1999,
    onSale: true,
    stockStatus: "instock",
    stockQuantity: 5,
    averageRating: 4.5,
    ratingCount: 120,
    categories: [{ id: 1, slug: "whey-protein", name: "Whey Protein" }],
    images: [{ id: 1, src: "https://images.unsplash.com/photo-1", alt: "Whey Protein" }],
    attributes: [],
    variations: [],
    nutrition: null,
    usageInstructions: null,
    storageInstructions: null,
    tags: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeVariation(overrides: Partial<ProductVariation> = {}): ProductVariation {
  return {
    id: 201,
    sku: "WP-VAR-CHOC-1KG",
    price: 1899,
    regularPrice: 2299,
    salePrice: 1899,
    onSale: true,
    stockStatus: "instock",
    stockQuantity: 3,
    weightGrams: 1000,
    image: null,
    attributes: { flavor: "Chocolate" },
    ...overrides,
  };
}

/** A variable product with two variations: one limited-stock in-stock, one out-of-stock. */
export function makeVariableProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 2,
    slug: "whey-protein-variable",
    name: "Whey Protein",
    type: "variable",
    status: "publish",
    featured: true,
    shortDescription: "Whey protein, available in multiple flavors.",
    description: "Full description of the variable whey protein.",
    sku: "WP-VAR",
    currency: "INR",
    price: 1799,
    regularPrice: 2299,
    salePrice: null,
    onSale: false,
    stockStatus: "instock",
    stockQuantity: null,
    averageRating: 4.2,
    ratingCount: 50,
    categories: [{ id: 1, slug: "whey-protein", name: "Whey Protein" }],
    images: [{ id: 2, src: "https://images.unsplash.com/photo-2", alt: "Whey Protein" }],
    attributes: [
      { id: 1, name: "Flavor", slug: "flavor", options: ["Chocolate", "Vanilla"], variation: true },
    ],
    variations: [
      makeVariation({
        id: 201,
        sku: "WP-VAR-CHOC-1KG",
        price: 1899,
        stockStatus: "instock",
        stockQuantity: 3,
        attributes: { flavor: "Chocolate" },
      }),
      makeVariation({
        id: 202,
        sku: "WP-VAR-VAN-1KG",
        price: 1799,
        stockStatus: "outofstock",
        stockQuantity: 0,
        attributes: { flavor: "Vanilla" },
      }),
    ],
    nutrition: null,
    usageInstructions: null,
    storageInstructions: null,
    tags: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}
