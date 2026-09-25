export function formatINR(amountInRupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountInRupees);
}

export function discountPercent(regularPrice: number, price: number): number {
  if (regularPrice <= 0 || price >= regularPrice) return 0;
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}
