import type {
  Category,
  NutritionFacts,
  Product,
  ProductAttribute,
  ProductVariation,
} from "@repo/types";
import type { WCCategory, WCMetaData, WCProduct, WCVariation } from "./wc-types";

function metaValue(metaData: WCMetaData[], key: string): string | null {
  const entry = metaData.find((m) => m.key === key);
  return entry ? String(entry.value) : null;
}

function toNumber(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapNutrition(metaData: WCMetaData[]): NutritionFacts | null {
  const servingSizeGrams = metaValue(metaData, "nutrition_serving_size_g");
  if (!servingSizeGrams) return null;
  return {
    servingSizeGrams: toNumber(servingSizeGrams),
    servingsPerContainer: toNumber(metaValue(metaData, "nutrition_servings_per_container")),
    calories: toNumber(metaValue(metaData, "nutrition_calories")),
    proteinGrams: toNumber(metaValue(metaData, "nutrition_protein_g")),
    carbsGrams: toNumber(metaValue(metaData, "nutrition_carbs_g")),
    fatGrams: toNumber(metaValue(metaData, "nutrition_fat_g")),
    sugarGrams: toNumber(metaValue(metaData, "nutrition_sugar_g")),
    ingredients: metaValue(metaData, "nutrition_ingredients") ?? "",
    allergens: (metaValue(metaData, "nutrition_allergens") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function mapAttribute(attr: WCProduct["attributes"][number]): ProductAttribute {
  return {
    id: attr.id,
    name: attr.name,
    slug: attr.slug ?? attr.name.toLowerCase(),
    options: attr.options,
    variation: attr.variation,
  };
}

export function mapVariation(variation: WCVariation): ProductVariation {
  const regularPrice = toNumber(variation.regular_price, toNumber(variation.price));
  const salePrice = variation.on_sale ? toNumber(variation.sale_price) : null;
  const attributes: Record<string, string> = {};
  for (const a of variation.attributes) attributes[a.name] = a.option;

  return {
    id: variation.id,
    sku: variation.sku,
    price: toNumber(variation.price),
    regularPrice,
    salePrice,
    onSale: variation.on_sale,
    stockStatus: variation.stock_status,
    stockQuantity: variation.stock_quantity,
    weightGrams: Math.round(toNumber(variation.weight) * 1000),
    image: variation.image ? { id: variation.image.id, src: variation.image.src, alt: variation.image.alt } : null,
    attributes,
  };
}

export function mapProduct(wc: WCProduct, variations: ProductVariation[]): Product {
  const regularPrice = toNumber(wc.regular_price, toNumber(wc.price));
  const salePrice = wc.on_sale ? toNumber(wc.sale_price) : null;

  return {
    id: wc.id,
    slug: wc.slug,
    name: wc.name,
    type: wc.type === "variable" ? "variable" : "simple",
    status: wc.status === "publish" ? "publish" : "draft",
    featured: wc.featured,
    shortDescription: wc.short_description.replace(/<[^>]+>/g, "").trim(),
    description: wc.description,
    sku: wc.sku,
    currency: "INR",
    price: toNumber(wc.price),
    regularPrice,
    salePrice,
    onSale: wc.on_sale,
    stockStatus: wc.stock_status,
    stockQuantity: wc.stock_quantity,
    averageRating: toNumber(wc.average_rating),
    ratingCount: wc.rating_count,
    categories: wc.categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
    images: wc.images.map((img) => ({ id: img.id, src: img.src, alt: img.alt || wc.name })),
    attributes: wc.attributes.map(mapAttribute),
    variations,
    nutrition: mapNutrition(wc.meta_data),
    usageInstructions: metaValue(wc.meta_data, "usage_instructions"),
    storageInstructions: metaValue(wc.meta_data, "storage_instructions"),
    tags: wc.tags.map((t) => t.slug),
    createdAt: wc.date_created,
  };
}

export function mapCategory(wc: WCCategory): Category {
  return {
    id: wc.id,
    slug: wc.slug,
    name: wc.name,
    description: wc.description,
    image: wc.image?.src ?? null,
    productCount: wc.count,
  };
}
