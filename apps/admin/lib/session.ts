import "server-only";
import { cookies } from "next/headers";

const WP_URL = process.env.WC_URL ?? "http://localhost:8080";
const COOKIE_NAME = "pp_admin_session";

export interface AdminSession {
  id: number;
  name: string;
  email: string;
  roles: string[];
  capabilities: string[];
}

export function can(session: AdminSession | null, capability: string): boolean {
  return session?.capabilities.includes(capability) ?? false;
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getSession(): Promise<AdminSession | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const res = await fetch(`${WP_URL}/wp-json/peakprotein/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const { user } = (await res.json()) as { user: AdminSession };
  return user;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const WP_BASE_URL = WP_URL;
