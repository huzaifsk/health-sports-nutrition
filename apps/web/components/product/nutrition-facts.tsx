import type { NutritionFacts } from "@repo/types";

const ROWS: { label: string; key: keyof NutritionFacts; unit: string }[] = [
  { label: "Calories", key: "calories", unit: "" },
  { label: "Protein", key: "proteinGrams", unit: "g" },
  { label: "Carbohydrates", key: "carbsGrams", unit: "g" },
  { label: "of which Sugar", key: "sugarGrams", unit: "g" },
  { label: "Fat", key: "fatGrams", unit: "g" },
];

export function NutritionFactsTable({ nutrition }: { nutrition: NutritionFacts }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-sm overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          Serving size {nutrition.servingSizeGrams}g · {nutrition.servingsPerContainer} servings per container
        </div>
        <table className="w-full text-sm">
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-muted-foreground">{row.label}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {nutrition[row.key]}
                  {row.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 className="mb-1 text-sm font-medium">Ingredients</h4>
        <p className="text-sm text-muted-foreground">{nutrition.ingredients}</p>
      </div>

      {nutrition.allergens.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium">Allergens</h4>
          <p className="text-sm text-muted-foreground">Contains: {nutrition.allergens.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
