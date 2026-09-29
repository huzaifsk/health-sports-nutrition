import { adminOrderService, formatINR, productService } from "@repo/commerce";
import { AlertTriangle, IndianRupee, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LOW_STOCK_THRESHOLD = 15;

export default async function DashboardPage() {
  const [{ orders, revenue }, { items: products }] = await Promise.all([
    adminOrderService.recentStats(30),
    productService.list({ perPage: 100 }),
  ]);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity !== null && p.stockQuantity <= LOW_STOCK_THRESHOLD,
  );
  const pendingOrders = orders.filter((o) => ["pending", "processing", "on-hold"].includes(o.status));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue (30d)" value={formatINR(revenue)} icon={IndianRupee} hint={`${orders.length} orders`} />
        <KpiCard label="Pending Orders" value={String(pendingOrders.length)} icon={ShoppingCart} />
        <KpiCard label="Products" value={String(products.length)} icon={Package} />
        <KpiCard
          label="Low Stock"
          value={String(lowStockProducts.length)}
          icon={AlertTriangle}
          hint={lowStockProducts.length > 0 ? "Needs reordering" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 6).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.number}</TableCell>
                  <TableCell className="text-muted-foreground">{order.customerName}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(order.total)}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No orders in the last 30 days.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-medium">Low Stock</h2>
            <Link href="/inventory" className="text-xs text-muted-foreground hover:text-foreground">
              View inventory
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.slice(0, 6).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right tabular-nums text-amber-600">{p.stockQuantity}</TableCell>
                </TableRow>
              ))}
              {lowStockProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                    Everything is well stocked.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
