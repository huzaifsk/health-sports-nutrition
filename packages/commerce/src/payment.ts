export interface PaymentChargeRequest {
  orderNumber: string;
  amount: number;
  currency: "INR";
  method: "card" | "upi" | "cod";
}

export interface PaymentChargeResult {
  success: boolean;
  transactionId: string | null;
  failureReason: string | null;
}

/**
 * Payment provider abstraction (PRD §14) — swap `MockPaymentProvider` for a
 * real gateway (Razorpay/Stripe) adapter later without touching call sites.
 * Mirrors the CommerceAdapter pattern in packages/woo-commerce.
 */
export interface PaymentProvider {
  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (request.method === "cod") {
      return { success: true, transactionId: null, failureReason: null };
    }

    const success = Math.random() > 0.05;
    if (!success) {
      return { success: false, transactionId: null, failureReason: "Payment declined by issuing bank." };
    }
    return { success: true, transactionId: `mock_txn_${crypto.randomUUID().slice(0, 12)}`, failureReason: null };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
