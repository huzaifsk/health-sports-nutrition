export interface Coupon {
  code: string;
  description: string;
  minOrderValue: number;
  compute(subtotal: number): number;
}

const COUPONS: Coupon[] = [
  {
    code: "FIRST20",
    description: "20% off your first order (up to ₹500)",
    minOrderValue: 999,
    compute: (subtotal) => Math.min(Math.round(subtotal * 0.2), 500),
  },
  {
    code: "WELCOME10",
    description: "Flat ₹200 off orders above ₹1500",
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
