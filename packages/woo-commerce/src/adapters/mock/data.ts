import type {
  Category,
  NutritionFacts,
  Product,
  ProductAttribute,
  ProductImage,
  ProductVariation,
} from "@repo/types";

let nextId = 1000;
const id = () => nextId++;

/**
 * Unsplash-hosted stock photography (Unsplash License — free to use, no
 * attribution required). PeakProtein has no real product photography yet,
 * so these stand in as topically-accurate placeholders until real shots
 * exist. Picking a single representative photo per product/category keeps
 * the storefront visually coherent instead of unrelated random imagery.
 */
function photo(photoId: string, alt: string): ProductImage {
  return {
    id: id(),
    src: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`,
    alt,
  };
}

const PHOTOS = {
  wheyGold: "photo-1774793476310-fd7d843184c5",
  wheyRaw: "photo-1704650312191-005ab02786f5",
  isolate: "photo-1704650311190-7eeb9c4f6e11",
  plant: "photo-1693996045899-7cf0ac0229c7",
  creatine: "photo-1693996045435-af7c48b9cafb",
  massGainer: "photo-1704650311298-4d6915d34c64",
  preWorkout: "photo-1693996046744-d7d7434bc777",
} as const;

interface SizeOption {
  label: string;
  weightGrams: number;
  priceMultiplier: number;
}

interface VariantMatrixInput {
  slugPrefix: string;
  basePrice: number;
  flavors: string[];
  sizes: SizeOption[];
  saleFlavors?: string[];
}

function buildVariations({
  slugPrefix,
  basePrice,
  flavors,
  sizes,
  saleFlavors = [],
}: VariantMatrixInput): ProductVariation[] {
  const variations: ProductVariation[] = [];
  for (const flavor of flavors) {
    for (const size of sizes) {
      const regularPrice = Math.round((basePrice * size.priceMultiplier) / 10) * 10;
      const onSale = saleFlavors.includes(flavor);
      const salePrice = onSale ? Math.round((regularPrice * 0.85) / 10) * 10 : null;
      variations.push({
        id: id(),
        sku: `${slugPrefix}-${flavor.slice(0, 3).toUpperCase()}-${size.label}`.toUpperCase(),
        price: salePrice ?? regularPrice,
        regularPrice,
        salePrice,
        onSale,
        stockStatus: "instock",
        stockQuantity: Math.floor(Math.random() * 60) + 10,
        weightGrams: size.weightGrams,
        image: null,
        attributes: { Flavor: flavor, Size: size.label },
      });
    }
  }
  return variations;
}

function attributesFromVariations(flavors: string[], sizes: string[]): ProductAttribute[] {
  return [
    { id: id(), name: "Flavor", slug: "flavor", options: flavors, variation: true },
    { id: id(), name: "Size", slug: "size", options: sizes, variation: true },
  ];
}

const wheyNutrition: NutritionFacts = {
  servingSizeGrams: 30,
  servingsPerContainer: 33,
  calories: 120,
  proteinGrams: 25,
  carbsGrams: 3,
  fatGrams: 1.5,
  sugarGrams: 1,
  ingredients:
    "Whey Protein Concentrate, Whey Protein Isolate, Cocoa Powder, Natural & Artificial Flavors, Lecithin, Sucralose.",
  allergens: ["Milk", "Soy"],
};

const isolateNutrition: NutritionFacts = {
  servingSizeGrams: 30,
  servingsPerContainer: 30,
  calories: 110,
  proteinGrams: 27,
  carbsGrams: 1,
  fatGrams: 0.5,
  sugarGrams: 0.5,
  ingredients: "Whey Protein Isolate, Natural & Artificial Flavors, Lecithin, Sucralose.",
  allergens: ["Milk"],
};

const plantNutrition: NutritionFacts = {
  servingSizeGrams: 34,
  servingsPerContainer: 29,
  calories: 130,
  proteinGrams: 24,
  carbsGrams: 4,
  fatGrams: 2,
  sugarGrams: 0.5,
  ingredients: "Pea Protein Isolate, Brown Rice Protein, Natural Flavors, Stevia Leaf Extract.",
  allergens: [],
};

const massGainerNutrition: NutritionFacts = {
  servingSizeGrams: 150,
  servingsPerContainer: 20,
  calories: 650,
  proteinGrams: 50,
  carbsGrams: 90,
  fatGrams: 8,
  sugarGrams: 12,
  ingredients:
    "Maltodextrin, Whey Protein Concentrate, Oat Flour, MCT Powder, Natural & Artificial Flavors.",
  allergens: ["Milk", "Soy"],
};

const categories: Category[] = [
  {
    id: id(),
    slug: "whey-protein",
    name: "Whey Protein",
    description: "Fast-absorbing whey protein concentrate blends for everyday recovery.",
    image: `https://images.unsplash.com/${PHOTOS.wheyGold}?auto=format&fit=crop&w=800&q=80`,
    productCount: 2,
  },
  {
    id: id(),
    slug: "protein-isolate",
    name: "Protein Isolate",
    description: "Ultra-filtered, low-carb, low-fat isolate for lean muscle support.",
    image: `https://images.unsplash.com/${PHOTOS.isolate}?auto=format&fit=crop&w=800&q=80`,
    productCount: 1,
  },
  {
    id: id(),
    slug: "plant-protein",
    name: "Plant Protein",
    description: "100% vegan pea + rice protein blends, dairy-free.",
    image: `https://images.unsplash.com/${PHOTOS.plant}?auto=format&fit=crop&w=800&q=80`,
    productCount: 1,
  },
  {
    id: id(),
    slug: "creatine",
    name: "Creatine",
    description: "Micronized creatine monohydrate for strength and power output.",
    image: `https://images.unsplash.com/${PHOTOS.creatine}?auto=format&fit=crop&w=800&q=80`,
    productCount: 1,
  },
  {
    id: id(),
    slug: "mass-gainer",
    name: "Mass Gainer",
    description: "High-calorie blends for clean, consistent weight gain.",
    image: `https://images.unsplash.com/${PHOTOS.massGainer}?auto=format&fit=crop&w=800&q=80`,
    productCount: 1,
  },
  {
    id: id(),
    slug: "pre-workout",
    name: "Pre-Workout",
    description: "Focus and energy formulas dosed for training days.",
    image: `https://images.unsplash.com/${PHOTOS.preWorkout}?auto=format&fit=crop&w=800&q=80`,
    productCount: 1,
  },
];

const sizesStandard: SizeOption[] = [
  { label: "1kg", weightGrams: 1000, priceMultiplier: 1 },
  { label: "2kg", weightGrams: 2000, priceMultiplier: 1.85 },
];

const wheyFlavors = ["Chocolate", "Vanilla", "Cookies & Cream"];
const wheyVariations = buildVariations({
  slugPrefix: "WHEY-GOLD",
  basePrice: 2999,
  flavors: wheyFlavors,
  sizes: sizesStandard,
  saleFlavors: ["Chocolate"],
});

const isolateFlavors = ["Chocolate", "Vanilla"];
const isolateVariations = buildVariations({
  slugPrefix: "ISO-PEAK",
  basePrice: 3999,
  flavors: isolateFlavors,
  sizes: sizesStandard,
});

const plantFlavors = ["Chocolate", "Unflavored"];
const plantVariations = buildVariations({
  slugPrefix: "PLANT-PURE",
  basePrice: 2799,
  flavors: plantFlavors,
  sizes: sizesStandard,
  saleFlavors: ["Chocolate"],
});

const massFlavors = ["Chocolate", "Vanilla"];
const massSizes: SizeOption[] = [
  { label: "3kg", weightGrams: 3000, priceMultiplier: 1 },
  { label: "6kg", weightGrams: 6000, priceMultiplier: 1.9 },
];
const massVariations = buildVariations({
  slugPrefix: "MASS-BULK",
  basePrice: 2499,
  flavors: massFlavors,
  sizes: massSizes,
});

function summarizeVariations(variations: ProductVariation[]) {
  const prices = variations.map((v) => v.price);
  const regularPrices = variations.map((v) => v.regularPrice);
  const onSale = variations.some((v) => v.onSale);
  const stockQuantity = variations.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
  return {
    price: Math.min(...prices),
    regularPrice: onSale ? Math.min(...regularPrices) : Math.min(...prices),
    salePrice: onSale ? Math.min(...prices) : null,
    onSale,
    stockQuantity,
  };
}

const wheySummary = summarizeVariations(wheyVariations);
const isolateSummary = summarizeVariations(isolateVariations);
const plantSummary = summarizeVariations(plantVariations);
const massSummary = summarizeVariations(massVariations);

export const products: Product[] = [
  {
    id: id(),
    slug: "gold-standard-whey-protein",
    name: "Gold Standard Whey Protein",
    type: "variable",
    status: "publish",
    featured: true,
    shortDescription: "25g protein per serving. Mixes clean, tastes better than the leading brand.",
    description:
      "Our best-selling whey protein concentrate blend delivers 25g of high-quality protein per serving to support muscle recovery and growth. Fast-absorbing and low in sugar, it's built for daily training.",
    sku: "WHEY-GOLD",
    currency: "INR",
    ...wheySummary,
    stockStatus: "instock",
    averageRating: 4.6,
    ratingCount: 812,
    categories: [{ id: categories[0]!.id, slug: "whey-protein", name: "Whey Protein" }],
    images: [photo(PHOTOS.wheyGold, "Gold Standard Whey Protein tub and shaker")],
    attributes: attributesFromVariations(wheyFlavors, ["1kg", "2kg"]),
    variations: wheyVariations,
    nutrition: wheyNutrition,
    usageInstructions: "Mix 1 scoop (30g) with 200-250ml cold water or milk. Take 1-2 servings daily.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight. Reseal after each use.",
    tags: ["bestseller", "whey"],
    createdAt: "2025-11-02T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "raw-whey-protein-unflavored",
    name: "Raw Whey Protein (Unflavored)",
    type: "simple",
    status: "publish",
    featured: false,
    shortDescription: "No additives, no sweeteners — just pure whey concentrate.",
    description:
      "For lifters who want full control over what goes in their shaker. Single-ingredient whey protein concentrate with nothing else added.",
    sku: "WHEY-RAW-1KG",
    currency: "INR",
    price: 2599,
    regularPrice: 2599,
    salePrice: null,
    onSale: false,
    stockStatus: "instock",
    stockQuantity: 34,
    averageRating: 4.3,
    ratingCount: 156,
    categories: [{ id: categories[0]!.id, slug: "whey-protein", name: "Whey Protein" }],
    images: [photo(PHOTOS.wheyRaw, "Raw Whey Protein powder and scoop")],
    attributes: [],
    variations: [],
    nutrition: { ...wheyNutrition, sugarGrams: 0, ingredients: "100% Whey Protein Concentrate.", allergens: ["Milk"] },
    usageInstructions: "Mix 1 scoop (30g) with 200-250ml cold water or milk.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    tags: ["unflavored", "whey"],
    createdAt: "2025-08-14T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "peak-isolate-protein",
    name: "Peak Isolate Protein",
    type: "variable",
    status: "publish",
    featured: true,
    shortDescription: "27g protein, near-zero fat and carbs. Ultra-filtered for lean gains.",
    description:
      "Peak Isolate is cross-flow microfiltered to strip out excess fat and lactose, leaving a fast-digesting, high-purity protein source ideal for cutting phases and lactose-sensitive lifters.",
    sku: "ISO-PEAK",
    currency: "INR",
    ...isolateSummary,
    stockStatus: "instock",
    averageRating: 4.7,
    ratingCount: 431,
    categories: [{ id: categories[1]!.id, slug: "protein-isolate", name: "Protein Isolate" }],
    images: [photo(PHOTOS.isolate, "Peak Isolate Protein jar and scoop")],
    attributes: attributesFromVariations(isolateFlavors, ["1kg", "2kg"]),
    variations: isolateVariations,
    nutrition: isolateNutrition,
    usageInstructions: "Mix 1 scoop (30g) with 200ml cold water. Best taken post-workout.",
    storageInstructions: "Store in a cool, dry place. Keep lid tightly sealed.",
    tags: ["isolate", "low-carb"],
    createdAt: "2025-12-01T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "pure-plant-protein",
    name: "Pure Plant Protein",
    type: "variable",
    status: "publish",
    featured: true,
    shortDescription: "24g plant-based protein. 100% dairy-free, soy-free.",
    description:
      "A smooth-mixing blend of pea and brown rice protein delivering a complete amino acid profile without any animal products. Naturally sweetened with stevia.",
    sku: "PLANT-PURE",
    currency: "INR",
    ...plantSummary,
    stockStatus: "instock",
    averageRating: 4.4,
    ratingCount: 268,
    categories: [{ id: categories[2]!.id, slug: "plant-protein", name: "Plant Protein" }],
    images: [photo(PHOTOS.plant, "Pure Plant Protein jar and scoop")],
    attributes: attributesFromVariations(plantFlavors, ["1kg", "2kg"]),
    variations: plantVariations,
    nutrition: plantNutrition,
    usageInstructions: "Mix 1 scoop (34g) with 250ml plant milk or water.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    tags: ["vegan", "plant-based"],
    createdAt: "2025-09-20T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "micronized-creatine-monohydrate",
    name: "Micronized Creatine Monohydrate",
    type: "simple",
    status: "publish",
    featured: true,
    shortDescription: "5g pure creatine per serving. The most researched strength supplement.",
    description:
      "Unflavored, micronized creatine monohydrate for improved strength, power output and training volume. Mixes easily into any shake or drink.",
    sku: "CREA-MONO-250G",
    currency: "INR",
    price: 899,
    regularPrice: 999,
    salePrice: 899,
    onSale: true,
    stockStatus: "instock",
    stockQuantity: 120,
    averageRating: 4.8,
    ratingCount: 1042,
    categories: [{ id: categories[3]!.id, slug: "creatine", name: "Creatine" }],
    images: [photo(PHOTOS.creatine, "Micronized Creatine Monohydrate jar and scoop")],
    attributes: [],
    variations: [],
    nutrition: {
      servingSizeGrams: 5,
      servingsPerContainer: 50,
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      sugarGrams: 0,
      ingredients: "100% Micronized Creatine Monohydrate.",
      allergens: [],
    },
    usageInstructions: "Take 1 scoop (5g) daily with water, any time of day.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    tags: ["creatine", "strength"],
    createdAt: "2025-07-10T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "clean-bulk-mass-gainer",
    name: "Clean Bulk Mass Gainer",
    type: "variable",
    status: "publish",
    featured: false,
    shortDescription: "650 calories, 50g protein per serving for serious size gains.",
    description:
      "A calorie-dense blend of complex carbs, whey protein and healthy fats designed for hardgainers who struggle to hit their calorie targets through food alone.",
    sku: "MASS-BULK",
    currency: "INR",
    ...massSummary,
    stockStatus: "instock",
    averageRating: 4.2,
    ratingCount: 189,
    categories: [{ id: categories[4]!.id, slug: "mass-gainer", name: "Mass Gainer" }],
    images: [photo(PHOTOS.massGainer, "Clean Bulk Mass Gainer tub and scoop")],
    attributes: attributesFromVariations(massFlavors, ["3kg", "6kg"]),
    variations: massVariations,
    nutrition: massGainerNutrition,
    usageInstructions: "Mix 3 scoops (150g) with 400-500ml milk. 1-2 servings daily between meals.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    tags: ["mass-gainer", "bulk"],
    createdAt: "2025-06-05T00:00:00.000Z",
  },
  {
    id: id(),
    slug: "ignite-pre-workout",
    name: "Ignite Pre-Workout",
    type: "simple",
    status: "publish",
    featured: true,
    shortDescription: "200mg caffeine, citrulline malate and beta-alanine for locked-in sessions.",
    description:
      "A clinically dosed pre-workout formula built around caffeine, L-citrulline malate and beta-alanine to drive focus, pumps and endurance through your hardest sessions.",
    sku: "PRE-IGNITE-300G",
    currency: "INR",
    price: 1799,
    regularPrice: 1799,
    salePrice: null,
    onSale: false,
    stockStatus: "instock",
    stockQuantity: 8,
    averageRating: 4.5,
    ratingCount: 312,
    categories: [{ id: categories[5]!.id, slug: "pre-workout", name: "Pre-Workout" }],
    images: [photo(PHOTOS.preWorkout, "Ignite Pre-Workout container and scoop")],
    attributes: [],
    variations: [],
    nutrition: {
      servingSizeGrams: 10,
      servingsPerContainer: 30,
      calories: 5,
      proteinGrams: 0,
      carbsGrams: 1,
      fatGrams: 0,
      sugarGrams: 0,
      ingredients:
        "L-Citrulline Malate, Beta-Alanine, Caffeine Anhydrous, L-Tyrosine, Niacin, Natural Flavors.",
      allergens: [],
    },
    usageInstructions: "Mix 1 scoop with 200ml cold water 20-30 minutes before training.",
    storageInstructions: "Store in a cool, dry place away from direct sunlight.",
    tags: ["pre-workout", "energy"],
    createdAt: "2025-10-18T00:00:00.000Z",
  },
];

export const mockCategories = categories;
