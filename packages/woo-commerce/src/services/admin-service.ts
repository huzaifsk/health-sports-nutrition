import { createWooCommerceClient, readWooCommerceCredentialsFromEnv } from "../client";
import type { AdminCustomer, AdminOrder, AdminOrderLineItem } from "./admin-types";

/**
 * Live-only admin operations (orders, customers, coupons, stock writes).
 * Unlike ProductService/CategoryService, there's no mock fallback here —
 * an admin tool without a real WooCommerce connection can't do anything
 * useful, so we throw clearly instead of pretending to work.
 */
function requireClient() {
  const credentials = readWooCommerceCredentialsFromEnv();
  if (!credentials) {
    throw new Error(
      "WC_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not set — the admin app requires a live WooCommerce connection.",
    );
  }
  return createWooCommerceClient(credentials);
}

function toNumber(value: string | number | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

interface WCOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  billing: { first_name: string; last_name: string; email: string };
  payment_method_title: string;
  date_created: string;
  line_items: { name: string; quantity: number; total: string; sku: string }[];
}

function mapOrder(o: WCOrder): AdminOrder {
  return {
    id: o.id,
    number: o.number,
    status: o.status,
    currency: "INR",
    total: toNumber(o.total),
    customerName: `${o.billing.first_name} ${o.billing.last_name}`.trim() || "Guest",
    customerEmail: o.billing.email,
    paymentMethodTitle: o.payment_method_title,
    lineItems: o.line_items.map(
      (li): AdminOrderLineItem => ({ name: li.name, quantity: li.quantity, total: toNumber(li.total), sku: li.sku }),
    ),
    createdAt: o.date_created,
  };
}

export const adminOrderService = {
  async list(params: { status?: string; page?: number; perPage?: number } = {}): Promise<{
    items: AdminOrder[];
    total: number;
    totalPages: number;
  }> {
    const client = requireClient();
    const response = await client.get("orders", {
      status: params.status ?? "any",
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
      orderby: "date",
      order: "desc",
    });
    return {
      items: (response.data as WCOrder[]).map(mapOrder),
      total: Number(response.headers["x-wp-total"] ?? response.data.length),
      totalPages: Number(response.headers["x-wp-totalpages"] ?? 1),
    };
  },

  async updateStatus(orderId: number, status: string): Promise<AdminOrder> {
    const client = requireClient();
    const { data } = await client.put(`orders/${orderId}`, { status });
    return mapOrder(data as WCOrder);
  },

  /** Recent orders for dashboard KPIs — summed client-side, WC has no aggregate endpoint in v3. */
  async recentStats(days: number): Promise<{ orders: AdminOrder[]; revenue: number }> {
    const client = requireClient();
    const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await client.get("orders", {
      after,
      per_page: 100,
      status: "any",
      orderby: "date",
      order: "desc",
    });
    const orders = (data as WCOrder[]).map(mapOrder);
    const revenue = orders
      .filter((o) => ["processing", "completed"].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);
    return { orders, revenue };
  },
};

interface WCCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_created: string;
  orders_count?: number;
  total_spent?: string;
}

export const adminCustomerService = {
  async list(params: { page?: number; perPage?: number } = {}): Promise<{ items: AdminCustomer[]; total: number }> {
    const client = requireClient();
    const response = await client.get("customers", { page: params.page ?? 1, per_page: params.perPage ?? 20 });
    const items = (response.data as WCCustomer[]).map(
      (c): AdminCustomer => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim() || c.email,
        email: c.email,
        ordersCount: c.orders_count ?? 0,
        totalSpent: toNumber(c.total_spent),
        dateCreated: c.date_created,
      }),
    );
    return { items, total: Number(response.headers["x-wp-total"] ?? items.length) };
  },
};
