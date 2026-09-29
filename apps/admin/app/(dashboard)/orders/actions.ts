"use server";

import { adminOrderService } from "@repo/commerce";
import { revalidatePath } from "next/cache";
import { can, getSession } from "@/lib/session";

export async function updateOrderStatusAction(orderId: number, status: string) {
  const session = await getSession();
  if (!can(session, "peakprotein_manage_orders")) {
    throw new Error("You don't have permission to update orders.");
  }
  await adminOrderService.updateStatus(orderId, status);
  revalidatePath("/orders");
  revalidatePath("/");
}
