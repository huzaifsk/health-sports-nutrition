import { createWooCommerceClient, readWooCommerceCredentialsFromEnv } from "../client";

function requireClient() {
  const credentials = readWooCommerceCredentialsFromEnv();
  if (!credentials) {
    throw new Error("WC_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not set — cannot create a real order.");
  }
  return createWooCommerceClient(credentials);
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface CheckoutLineItem {
  productId: number;
  variationId: number | null;
  quantity: number;
}

export interface CreateOrderInput {
  lineItems: CheckoutLineItem[];
  billing: CheckoutAddress;
  paymentMethod: string;
  paymentMethodTitle: string;
  couponCode: string | null;
  shippingLine: { methodId: string; methodTitle: string; total: string };
  setPaid: boolean;
}

export interface CreatedOrder {
  id: number;
  number: string;
  status: string;
  total: number;
}

export class WooCommerceOrderError extends Error {
  constructor(
    message: string,
    public readonly wcCode: string | undefined,
  ) {
    super(message);
  }
}

/**
 * Creates a real WooCommerce order. WooCommerce (not our own JS) validates
 * the coupon, recalculates line-item totals from live product prices, and
 * is the authoritative total — see PRD §14 ("payment should never be
 * considered successful based solely on frontend state").
 */
export async function createRealOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const client = requireClient();

  const address = {
    first_name: input.billing.firstName,
    last_name: input.billing.lastName,
    address_1: input.billing.address1,
    address_2: input.billing.address2,
    city: input.billing.city,
    state: input.billing.state,
    postcode: input.billing.postcode,
    country: input.billing.country,
  };

  try {
    const { data } = await client.post("orders", {
      payment_method: input.paymentMethod,
      payment_method_title: input.paymentMethodTitle,
      set_paid: input.setPaid,
      billing: { ...address, email: input.billing.email, phone: input.billing.phone },
      shipping: address,
      line_items: input.lineItems.map((item) => ({
        product_id: item.productId,
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      })),
      shipping_lines: [
        { method_id: input.shippingLine.methodId, method_title: input.shippingLine.methodTitle, total: input.shippingLine.total },
      ],
      coupon_lines: input.couponCode ? [{ code: input.couponCode }] : [],
    });
    return { id: data.id, number: data.number, status: data.status, total: Number(data.total) };
  } catch (error) {
    const wcError = (error as { response?: { data?: { message?: string; code?: string } } }).response?.data;
    throw new WooCommerceOrderError(wcError?.message ?? "Failed to create order.", wcError?.code);
  }
}

export async function updateRealOrderStatus(orderId: number, status: string): Promise<void> {
  const client = requireClient();
  await client.put(`orders/${orderId}`, { status });
}
