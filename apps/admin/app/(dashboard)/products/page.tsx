import { formatINR, productService } from "@repo/commerce";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, getSession } from "@/lib/session";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const session = await getSession();
  if (!can(session, "peakprotein_view_products")) redirect("/");

  const { items: products } = await productService.list({ perPage: 100 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">{products.length} products</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-muted-foreground">{p.categories[0]?.name}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{p.type}</TableCell>
                <TableCell className="text-right tabular-nums">{formatINR(p.price)}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stockQuantity ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.stockStatus === "instock" ? "secondary" : "destructive"}>
                    {p.stockStatus === "instock" ? "In stock" : "Out of stock"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
