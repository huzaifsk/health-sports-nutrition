import { BrandBenefits } from "@/components/home/brand-benefits";
import { CategoryTiles } from "@/components/home/category-tiles";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandBenefits />
      <CategoryTiles />
      <FeaturedProducts />
    </>
  );
}
