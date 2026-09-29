import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Account",
};

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return children;
}
