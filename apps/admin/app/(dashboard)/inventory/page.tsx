import { adminOrderService, productService } from "@repo/commerce";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, getSession } from "@/lib/session";

export const metadata = { title: "Inventory" };

const LOOKBACK_DAYS = 30;

function stockStatusLabel(quantity: number | null): { label: string; variant: "secondary" | "destructive" | "outline" } {
  if (quantity === null) return { label: "Unmanaged", variant: "outline" };
  if (quantity <= 0) return { label: "Out of stock", variant: "destructive" };
  if (quantity <= 15) return { label: "Reorder soon", variant: "destructive" };
  if (quantity <= 30) return { label: "Low", variant: "outline" };
  return { label: "Healthy", variant: "secondary" };
}

export default async function InventoryPage() {
  const session = await getSession();
  if (!can(session, "peakprotein_view_inventory")) redirect("/");

  const [{ items: products }, { orders }] = await Promise.all([
    productService.list({ perPage: 100 }),
    adminOrderService.recentStats(LOOKBACK_DAYS),
  ]);

  const soldBySku = new Map<string, number>();
  for (const order of orders) {
    if (!["processing", "completed"].includes(order.status)) continue;
    for (const item of order.lineItems) {
      soldBySku.set(item.sku, (soldBySku.get(item.sku) ?? 0) + item.quantity);
    }
  }

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * (p.stockQuantity ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Sales velocity is application-level, calculated from the last {LOOKBACK_DAYS} days of real orders — it
          does not replace WooCommerce&apos;s own stock records, which remain the source of truth.
        </p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Sold ({LOOKBACK_DAYS}d)</TableHead>
              <TableHead className="text-right">Daily Velocity</TableHead>
              <TableHead className="text-right">Est. Days Remaining</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const sold = soldBySku.get(p.sku) ?? 0;
              const velocity = sold / LOOKBACK_DAYS;
              const daysRemaining = velocity > 0 && p.stockQuantity !== null ? Math.round(p.stockQuantity / velocity) : null;
              const status = stockStatusLabel(p.stockQuantity);

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.stockQuantity ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{sold}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {velocity > 0 ? velocity.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {daysRemaining !== null ? `${daysRemaining}d` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Total inventory value (stock × price):{" "}
        <span className="font-medium text-foreground">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
            totalInventoryValue,
          )}
        </span>
      </p>
    </div>
  );
}
