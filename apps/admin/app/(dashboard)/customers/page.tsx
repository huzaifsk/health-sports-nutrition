import { adminCustomerService, formatINR } from "@repo/commerce";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can, getSession } from "@/lib/session";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const session = await getSession();
  if (!can(session, "peakprotein_view_customers")) redirect("/");

  const { items: customers, total } = await adminCustomerService.list({ perPage: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{total} customers</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(c.dateCreated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.ordersCount}</TableCell>
                <TableCell className="text-right tabular-nums">{formatINR(c.totalSpent)}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
