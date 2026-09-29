"use client";

import { formatINR } from "@repo/commerce";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useOrdersStore } from "@/lib/orders-store";

const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderList() {
  const orders = useOrdersStore((state) => state.orders);

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>;
  }

  return (
    <ul className="flex max-w-xl flex-col divide-y divide-border rounded-xl border border-border">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.orderNumber}`} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50">
            <div>
              <p className="text-sm font-medium">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums">{formatINR(order.totals.total)}</span>
              <Badge variant={order.orderStatus === "cancelled" ? "destructive" : "secondary"}>
                {ORDER_STATUS_LABEL[order.orderStatus]}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
