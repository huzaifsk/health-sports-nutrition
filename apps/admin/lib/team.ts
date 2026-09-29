import "server-only";
import type { AdminSession } from "./session";
import { getSessionToken, WP_BASE_URL } from "./session";

export interface TeamData {
  users: AdminSession[];
  assignableRoles: Record<string, string>;
}

async function wpFetch(path: string, init?: RequestInit) {
  const token = await getSessionToken();
  const res = await fetch(`${WP_BASE_URL}/wp-json/peakprotein/v1${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Request failed.");
  }
  return data;
}

export async function getTeam(): Promise<TeamData> {
  const data = await wpFetch("/team");
  return { users: data.users, assignableRoles: data.assignable_roles };
}

export async function changeUserRole(userId: number, role: string) {
  return wpFetch(`/team/${userId}/role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

export async function inviteUser(email: string, name: string, role: string): Promise<{ temp_password: string }> {
  return wpFetch("/team/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, role }),
  });
}
