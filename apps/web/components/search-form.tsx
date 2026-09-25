import { Search } from "lucide-react";
import { cn } from "cn";

export function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/products" method="get" className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name="q"
        placeholder="Search products"
        className="h-8 w-44 rounded-full border border-border bg-muted/40 pl-8 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 lg:w-56"
      />
    </form>
  );
}
