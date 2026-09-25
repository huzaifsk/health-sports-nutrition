import { productService } from "@repo/commerce";
import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";

export async function FeaturedProducts() {
  const products = await productService.listFeatured(8);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Best Sellers</h2>
          <p className="text-sm text-muted-foreground">Our most-loved formulas, restocked weekly.</p>
        </div>
        <Button
          variant="ghost"
          className="hidden sm:inline-flex"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          View all
        </Button>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
