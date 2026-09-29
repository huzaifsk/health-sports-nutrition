import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist",
};

export default function WishlistLayout({ children }: LayoutProps<"/wishlist">) {
  return children;
}
