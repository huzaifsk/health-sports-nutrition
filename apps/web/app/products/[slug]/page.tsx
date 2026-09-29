import type { Product } from "@repo/types";
import { productService } from "@repo/commerce";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchaseExperience } from "@/components/product/product-purchase-experience";
import { ProductTabs } from "@/components/product/product-tabs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://peakprotein.example.com";

const STOCK_STATUS_SCHEMA_MAP: Record<Product["stockStatus"], string> = {
  instock: "https://schema.org/InStock",
  outofstock: "https://schema.org/OutOfStock",
  onbackorder: "https://schema.org/BackOrder",
};

function buildProductJsonLd(product: Product) {
  const url = `${SITE_URL}/products/${product.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    url,
    image: product.images.map((image) => image.src),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: STOCK_STATUS_SCHEMA_MAP[product.stockStatus],
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (product.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.ratingCount,
    };
  }

  return jsonLd;
}

export async function generateStaticParams() {
  const { items } = await productService.list({ perPage: 100 });
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) notFound();

  const categorySlug = product.categories[0]?.slug;
  const related = categorySlug
    ? (await productService.list({ categorySlug, perPage: 5 })).items
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  const jsonLd = buildProductJsonLd(product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductPurchaseExperience product={product} />
      <ProductTabs product={product} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
