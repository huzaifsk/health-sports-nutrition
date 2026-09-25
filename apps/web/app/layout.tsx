import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

const bodyFont = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "variable",
});

const headingFont = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "PeakProtein — Premium Protein & Sports Nutrition",
    template: "%s — PeakProtein",
  },
  description:
    "Premium whey, isolate, plant protein, creatine, mass gainers and pre-workout, built for your next level.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartSheet />
        <Toaster />
      </body>
    </html>
  );
}
