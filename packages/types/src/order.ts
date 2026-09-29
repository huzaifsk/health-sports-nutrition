import type { Address } from "./address";
import type { CartTotals } from "./cart";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";

export type OrderStatus =
  | "placed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderLineItem {
  productId: number;
  variationId: number | null;
  slug: string;
  name: string;
  image: string | null;
  categorySlug: string | null;
  sku: string;
  attributes: Record<string, string>;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: Address;
  items: OrderLineItem[];
  totals: CartTotals;
  currency: "INR";
  couponCode: string | null;
  paymentMethod: "card" | "upi" | "cod";
  paymentStatus: PaymentStatus;
  paymentTransactionId: string | null;
  orderStatus: OrderStatus;
  timeline: OrderTimelineEvent[];
  createdAt: string;
}
