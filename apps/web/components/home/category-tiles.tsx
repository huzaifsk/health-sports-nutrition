import { categoryService } from "@repo/commerce";
import Image from "next/image";
import Link from "next/link";

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
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
              )}
            </div>
            <span className="text-center text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
