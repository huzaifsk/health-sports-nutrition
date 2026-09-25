import { categoryService } from "@repo/commerce";
import Link from "next/link";
import { ProductVisual } from "@/components/product/product-visual";

export async function CategoryTiles() {
  const categories = await categoryService.list();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="mb-8 font-heading text-2xl font-semibold tracking-tight">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex flex-col gap-2"
          >
            <ProductVisual
              categorySlug={category.slug}
              imageSrc={category.image}
              imageAlt={category.name}
              sizes="(min-width: 1024px) 16vw, 33vw"
              className="aspect-square rounded-xl"
            />
            <span className="text-center text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
