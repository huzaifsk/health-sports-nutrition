"use client";

import { Boxes, LayoutDashboard, Package, ShoppingCart, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  capability?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package, capability: "peakprotein_view_products" },
  { href: "/orders", label: "Orders", icon: ShoppingCart, capability: "peakprotein_view_orders" },
  { href: "/inventory", label: "Inventory", icon: Boxes, capability: "peakprotein_view_inventory" },
  { href: "/customers", label: "Customers", icon: Tag, capability: "peakprotein_view_customers" },
  { href: "/team", label: "Team", icon: Users, capability: "list_users" },
];

export function NavSidebar({ capabilities }: { capabilities: string[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.filter((item) => !item.capability || capabilities.includes(item.capability)).map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
