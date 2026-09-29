export interface Coupon {
  code: string;
  description: string;
  minOrderValue: number;
  compute(subtotal: number): number;
}

// Mirrors the real WooCommerce coupons created by
// wordpress/scripts/provision-coupons.php exactly (percent / minimum_amount)
// — this is only a client-side preview for the cart page; WooCommerce
// itself validates and applies the real coupon when the order is placed
// (see apps/web/app/checkout/actions.ts), so drift here would show the
// customer one discount in the cart and charge them a different one at
// checkout.
const COUPONS: Coupon[] = [
  {
    code: "FIRST20",
    description: "20% off your first order",
    minOrderValue: 999,
    compute: (subtotal) => Math.round(subtotal * 0.2),
  },
  {
    code: "WELCOME10",
    description: "Flat ₹200 off orders above ₹1,500",
    minOrderValue: 1500,
    compute: () => 200,
  },
];

export function findCoupon(code: string): Coupon | null {
  return COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ?? null;
}

export function applyCoupon(subtotal: number, code: string | null): number {
  if (!code) return 0;
  const coupon = findCoupon(code);
  if (!coupon || subtotal < coupon.minOrderValue) return 0;
  return Math.min(coupon.compute(subtotal), subtotal);
}
