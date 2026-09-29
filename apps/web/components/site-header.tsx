import { categoryService } from "@repo/commerce";
import { User } from "lucide-react";
import Link from "next/link";
import { CartButton } from "@/components/cart/cart-sheet";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { WishlistNavButton } from "@/components/wishlist/wishlist-nav-button";

export async function SiteHeader() {
  const categories = await categoryService.list();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="font-heading text-base font-semibold tracking-tight">
          Peak<span className="text-brand-foreground">Protein</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchForm className="hidden sm:block" />
          <WishlistNavButton />
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/account" aria-label="Your account" />}>
            <User />
          </Button>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
