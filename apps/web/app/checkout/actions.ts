"use server";

import {
  createRealOrder,
  FREE_SHIPPING_THRESHOLD,
  paymentProvider,
  STANDARD_SHIPPING_FEE,
  updateRealOrderStatus,
  WooCommerceOrderError,
} from "@repo/commerce";
import type { Cart } from "@repo/types";

interface PlaceOrderInput {
  cart: Cart;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: { line1: string; line2: string; city: string; state: string; pincode: string };
  paymentMethod: "card" | "upi" | "cod";
}

type PlaceOrderResult =
  | { success: true; orderNumber: string; orderId: number; total: number }
  | { success: false; error: string };

const PAYMENT_METHOD_TITLES: Record<PlaceOrderInput["paymentMethod"], string> = {
  card: "Credit / Debit Card",
  upi: "UPI",
  cod: "Cash on Delivery",
};

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (input.cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const [firstName, ...rest] = input.customerName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  const taxableSubtotal = input.cart.totals.subtotal - input.cart.totals.discountTotal;
  const shippingLine =
    taxableSubtotal >= FREE_SHIPPING_THRESHOLD
      ? { methodId: "free_shipping", methodTitle: "Free Shipping", total: "0" }
      : { methodId: "flat_rate", methodTitle: "Standard Shipping", total: String(STANDARD_SHIPPING_FEE) };

  let order;
  try {
    order = await createRealOrder({
      lineItems: input.cart.items.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      billing: {
        firstName: firstName ?? input.customerName,
        lastName,
        email: input.customerEmail,
        phone: input.phone,
        address1: input.address.line1,
        address2: input.address.line2,
        city: input.address.city,
        state: input.address.state,
        postcode: input.address.pincode,
        country: "IN",
      },
      paymentMethod: input.paymentMethod,
      paymentMethodTitle: PAYMENT_METHOD_TITLES[input.paymentMethod],
      couponCode: input.cart.couponCode,
      shippingLine,
      setPaid: false,
    });
  } catch (error) {
    if (error instanceof WooCommerceOrderError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const paymentResult = await paymentProvider.charge({
    orderNumber: order.number,
    amount: order.total,
    currency: "INR",
    method: input.paymentMethod,
  });

  await updateRealOrderStatus(order.id, paymentResult.success ? "processing" : "failed");

  if (!paymentResult.success) {
    return { success: false, error: paymentResult.failureReason ?? "Payment failed. Please try again." };
  }

  return { success: true, orderNumber: order.number, orderId: order.id, total: order.total };
}
