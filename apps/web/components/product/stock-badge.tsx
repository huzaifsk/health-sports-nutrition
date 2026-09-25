import type { StockStatus } from "@repo/types";
import { Badge } from "@/components/ui/badge";

const LOW_STOCK_THRESHOLD = 10;

export function StockBadge({
  status,
  quantity,
}: {
  status: StockStatus;
  quantity: number | null;
}) {
  if (status === "outofstock") {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (status === "onbackorder") {
    return <Badge variant="secondary">On backorder</Badge>;
  }
  if (quantity !== null && quantity <= LOW_STOCK_THRESHOLD) {
    return <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">Only {quantity} left</Badge>;
  }
  return <Badge variant="secondary">In stock</Badge>;
}
