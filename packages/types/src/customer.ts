import type { Address } from "./address";

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface WishlistItem {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  categorySlug: string | null;
  addedAt: string;
}

export interface ProductReview {
  id: string;
  productId: number;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}
