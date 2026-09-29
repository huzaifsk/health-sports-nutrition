"use client";

import type { ProductReview } from "@repo/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReviewsState {
  reviews: ProductReview[];
  addReview: (review: ProductReview) => void;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: [],
      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
    }),
    { name: "peakprotein-reviews" },
  ),
);

export function useProductReviews(productId: number) {
  return useReviewsStore((state) => state.reviews.filter((r) => r.productId === productId));
}
