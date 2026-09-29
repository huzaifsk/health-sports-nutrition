import { adminOrderService, formatINR } from "@repo/commerce";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, getSession } from "@/lib/session";
import { OrderStatusSelect } from "./order-status-select";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!can(session, "peakprotein_view_orders")) redirect("/");
  const canManage = can(session, "peakprotein_manage_orders");

  const { items: orders, total } = await adminOrderService.list({ perPage: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} orders</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.number}</TableCell>
                <TableCell>
                  <div className="text-sm">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.paymentMethodTitle || "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatINR(order.total)}</TableCell>
                <TableCell>
                  {canManage ? (
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  ) : (
                    <OrderStatusBadge status={order.status} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
