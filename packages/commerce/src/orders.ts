import type { Address, Cart, Order, OrderStatus } from "@repo/types";

function generateOrderNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PP-${new Date().getFullYear()}-${rand}`;
}

export function createOrderFromCart(
  cart: Cart,
  details: {
    customerName: string;
    customerEmail: string;
    shippingAddress: Address;
    paymentMethod: Order["paymentMethod"];
  },
): Order {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber(),
    customerName: details.customerName,
    customerEmail: details.customerEmail,
    shippingAddress: details.shippingAddress,
    items: cart.items.map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      categorySlug: item.categorySlug,
      sku: item.sku,
      attributes: item.attributes,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    totals: cart.totals,
    currency: "INR",
    couponCode: cart.couponCode,
    paymentMethod: details.paymentMethod,
    paymentStatus: "pending",
    paymentTransactionId: null,
    orderStatus: "placed",
    timeline: [{ status: "placed", timestamp: now }],
    createdAt: now,
  };
}

function withStatus(order: Order, status: OrderStatus): Order {
  return {
    ...order,
    orderStatus: status,
    timeline: [...order.timeline, { status, timestamp: new Date().toISOString() }],
  };
}

export function markOrderPaid(order: Order, transactionId: string | null): Order {
  const paid =
    order.paymentMethod === "cod"
      ? order
      : { ...order, paymentStatus: "paid" as const, paymentTransactionId: transactionId };
  return withStatus(paid, "processing");
}

export function markOrderFailed(order: Order): Order {
  return { ...order, paymentStatus: "failed" };
}
