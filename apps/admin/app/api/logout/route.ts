import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionToken, SESSION_COOKIE_NAME, WP_BASE_URL } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await fetch(`${WP_BASE_URL}/wp-json/peakprotein/v1/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => {});
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
