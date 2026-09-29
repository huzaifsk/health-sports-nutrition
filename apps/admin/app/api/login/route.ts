import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, WP_BASE_URL } from "@/lib/session";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const wpResponse = await fetch(`${WP_BASE_URL}/wp-json/peakprotein/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  const data = await wpResponse.json();
  if (!wpResponse.ok) {
    return NextResponse.json({ error: data.message ?? "Invalid credentials." }, { status: wpResponse.status });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ user: data.user });
}
