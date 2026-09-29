"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerStore } from "@/lib/customer-store";

export function AddressList() {
  const addresses = useCustomerStore((state) => state.profile?.addresses ?? []);
  const removeAddress = useCustomerStore((state) => state.removeAddress);

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved addresses yet — they&apos;re added automatically at checkout.
      </p>
    );
  }

  return (
    <ul className="flex max-w-sm flex-col gap-3">
      {addresses.map((address, index) => (
        <li key={index} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{address.fullName}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>
              {address.city}, {address.state} {address.pincode}
            </p>
            <p>{address.phone}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove address"
            onClick={() => removeAddress(index)}
          >
            <X />
          </Button>
        </li>
      ))}
    </ul>
  );
}
