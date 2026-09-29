import type { Product } from "@repo/types";
import { NutritionFactsTable } from "@/components/product/nutrition-facts";
import { ReviewsSection } from "@/components/product/reviews-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="description" className="mt-16">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        {product.nutrition && <TabsTrigger value="nutrition">Nutrition</TabsTrigger>}
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="max-w-2xl pt-6 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </TabsContent>
      {product.nutrition && (
        <TabsContent value="nutrition" className="pt-6">
          <NutritionFactsTable nutrition={product.nutrition} />
        </TabsContent>
      )}
      <TabsContent value="usage" className="max-w-2xl space-y-4 pt-6 text-sm text-muted-foreground">
        {product.usageInstructions && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">How to use</h4>
            <p>{product.usageInstructions}</p>
          </div>
        )}
        {product.storageInstructions && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-foreground">Storage</h4>
            <p>{product.storageInstructions}</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="reviews" className="pt-6">
        <ReviewsSection productId={product.id} />
      </TabsContent>
    </Tabs>
  );
}
