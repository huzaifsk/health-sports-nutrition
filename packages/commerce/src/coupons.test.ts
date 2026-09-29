import { describe, expect, it } from "vitest";
import { applyCoupon, findCoupon } from "./coupons";

describe("findCoupon", () => {
  it("finds a coupon case-insensitively and trims whitespace", () => {
    expect(findCoupon("first20")?.code).toBe("FIRST20");
    expect(findCoupon("  FIRST20  ")?.code).toBe("FIRST20");
  });

  it("returns null for an unknown code", () => {
    expect(findCoupon("NOT-REAL")).toBeNull();
  });
});

describe("applyCoupon — FIRST20", () => {
  it("applies 20% off, rounded, when the order meets the minimum", () => {
    expect(applyCoupon(1000, "FIRST20")).toBe(200); // round(1000 * 0.2)
  });

  it("caps the discount at ₹500", () => {
    expect(applyCoupon(5000, "FIRST20")).toBe(500); // 20% would be 1000, capped to 500
  });

  it("applies at exactly the minimum order value (999)", () => {
    expect(applyCoupon(999, "FIRST20")).toBe(200); // round(999 * 0.2) = 200
  });

  it("does not apply below the minimum order value", () => {
    expect(applyCoupon(998, "FIRST20")).toBe(0);
  });
});

describe("applyCoupon — WELCOME10", () => {
  it("applies a flat ₹200 off when the order meets the minimum", () => {
    expect(applyCoupon(1500, "WELCOME10")).toBe(200);
    expect(applyCoupon(3000, "WELCOME10")).toBe(200);
  });

  it("does not apply below the minimum order value (1500)", () => {
    expect(applyCoupon(1499, "WELCOME10")).toBe(0);
  });
});

describe("applyCoupon — invalid input", () => {
  it("returns 0 for an unknown coupon code", () => {
    expect(applyCoupon(5000, "NOT-A-REAL-CODE")).toBe(0);
  });

  it("returns 0 when no code is provided", () => {
    expect(applyCoupon(5000, null)).toBe(0);
  });

  it("never returns a discount larger than the subtotal", () => {
    // Subtotal just above WELCOME10's minimum order value, less than its flat ₹200 discount away
    // from zero: the discount must still never exceed the subtotal itself.
    expect(applyCoupon(1500, "WELCOME10")).toBeLessThanOrEqual(1500);
  });
});
