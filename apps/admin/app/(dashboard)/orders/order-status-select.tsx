"use client";

import { ORDER_STATUSES } from "@repo/commerce";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatusAction } from "./actions";

export function OrderStatusSelect({ orderId, status }: { orderId: number; status: string }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={isPending}
      onValueChange={(next) => {
        if (!next) return;
        const previous = value;
        setValue(next);
        startTransition(async () => {
          try {
            await updateOrderStatusAction(orderId, next);
            toast.success(`Order status updated to ${next}.`);
          } catch (err) {
            setValue(previous);
            toast.error(err instanceof Error ? err.message : "Failed to update order.");
          }
        });
      }}
    >
      <SelectTrigger size="sm" className="w-36 capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s.replace(/-/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
