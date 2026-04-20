import { NextResponse } from "next/server";

const THIRTY_MINUTES = 60 * 30;
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { rememberMe?: boolean };
  const rememberMe = Boolean(payload.rememberMe);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kk_last_activity", Date.now().toString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? SEVEN_DAYS : THIRTY_MINUTES,
    path: "/",
  });

  response.cookies.set("kk_session_mode", rememberMe ? "remember" : "standard", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? SEVEN_DAYS : THIRTY_MINUTES,
    path: "/",
  });

  return response;
}
