import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "on-hold": "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", STATUS_STYLES[status] ?? "")}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}
