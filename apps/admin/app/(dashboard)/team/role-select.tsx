"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changeRoleAction } from "./actions";

export function RoleSelect({
  userId,
  role,
  assignableRoles,
  disabled,
}: {
  userId: number;
  role: string;
  assignableRoles: Record<string, string>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(role);
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={disabled || isPending}
      onValueChange={(next) => {
        if (!next) return;
        const previous = value;
        setValue(next);
        startTransition(async () => {
          try {
            await changeRoleAction(userId, next);
            toast.success("Role updated.");
          } catch (err) {
            setValue(previous);
            toast.error(err instanceof Error ? err.message : "Failed to update role.");
          }
        });
      }}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue>{assignableRoles[value] ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(assignableRoles).map(([slug, label]) => (
          <SelectItem key={slug} value={slug}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
