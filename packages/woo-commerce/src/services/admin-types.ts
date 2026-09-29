export interface AdminOrderLineItem {
  name: string;
  quantity: number;
  total: number;
  sku: string;
}

export interface AdminOrder {
  id: number;
  number: string;
  status: string;
  currency: "INR";
  total: number;
  customerName: string;
  customerEmail: string;
  paymentMethodTitle: string;
  lineItems: AdminOrderLineItem[];
  createdAt: string;
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  dateCreated: string;
}

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
] as const;

export type AdminOrderStatus = (typeof ORDER_STATUSES)[number];
