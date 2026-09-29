"use server";

import { revalidatePath } from "next/cache";
import { can, getSession } from "@/lib/session";
import { changeUserRole, inviteUser } from "@/lib/team";

export async function changeRoleAction(userId: number, role: string) {
  const session = await getSession();
  if (!can(session, "promote_users")) {
    throw new Error("You don't have permission to change roles.");
  }
  await changeUserRole(userId, role);
  revalidatePath("/team");
}

export async function inviteAction(email: string, name: string, role: string) {
  const session = await getSession();
  if (!can(session, "create_users")) {
    throw new Error("You don't have permission to invite staff.");
  }
  const result = await inviteUser(email, name, role);
  revalidatePath("/team");
  return result;
}
