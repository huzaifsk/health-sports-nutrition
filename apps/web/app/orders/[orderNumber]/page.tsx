"use client";

import { formatINR } from "@repo/commerce";
import type { OrderStatus } from "@repo/types";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductVisual } from "@/components/product/product-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrderByNumber } from "@/lib/orders-store";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Order Placed" },
  { status: "processing", label: "Processing" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const order = useOrderByNumber(params.orderNumber);

  if (!order) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Order not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find that order on this device. Orders are stored locally per browser in this demo.
        </p>
        <Button render={<Link href="/products" />} nativeButton={false}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const activeStepIndex = order.orderStatus === "cancelled" ? -1 : TIMELINE_STEPS.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {order.orderStatus === "placed" && (
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-success/10 p-4">
          <CheckCircle2 className="size-6 shrink-0 text-success" />
          <div>
            <p className="font-medium">Thank you, {order.customerName.split(" ")[0]}!</p>
            <p className="text-sm text-muted-foreground">Your order has been placed successfully.</p>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge variant={order.paymentStatus === "paid" ? "secondary" : "outline"}>
          {PAYMENT_STATUS_LABEL[order.paymentStatus]}
        </Badge>
      </div>

      {order.orderStatus !== "cancelled" && (
        <ol className="mb-10 flex flex-wrap gap-y-4">
          {TIMELINE_STEPS.map((step, index) => (
            <li key={step.status} className="flex min-w-[6.5rem] flex-1 flex-col items-center gap-2 text-center">
              <div className="flex w-full items-center">
                <div
                  className={`h-px flex-1 ${index === 0 ? "opacity-0" : index <= activeStepIndex ? "bg-foreground" : "bg-border"}`}
                />
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    index <= activeStepIndex ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div
                  className={`h-px flex-1 ${index === TIMELINE_STEPS.length - 1 ? "opacity-0" : index < activeStepIndex ? "bg-foreground" : "bg-border"}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{step.label}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-sm font-medium">Items</h2>
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {order.items.map((item) => (
                <li key={`${item.productId}:${item.variationId ?? 0}`} className="flex gap-3 p-3">
                  <ProductVisual
                    categorySlug={item.categorySlug ?? undefined}
                    imageSrc={item.image}
                    imageAlt={item.name}
                    sizes="56px"
                    className="size-14 shrink-0 rounded-lg"
                  />
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-medium">{item.name}</p>
                    {Object.keys(item.attributes).length > 0 && (
                      <p className="text-xs text-muted-foreground">{Object.values(item.attributes).join(" / ")}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatINR(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium">Shipping Address</h2>
            <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <h2 className="text-sm font-medium">Payment Summary</h2>
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatINR(order.totals.subtotal)}</dd>
            </div>
            {order.totals.discountTotal > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums text-success">-{formatINR(order.totals.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">
                {order.totals.shippingTotal === 0 ? "Free" : formatINR(order.totals.shippingTotal)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(order.totals.total)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground capitalize">Paid via {order.paymentMethod}</p>
        </div>
      </div>
    </div>
  );
}
