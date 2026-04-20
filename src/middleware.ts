import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const protectedRoutes = ["/dashboard", "/paper-dtr", "/admin"];

function isProtected(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (!isProtected(pathname)) {
    return response;
  }

  const sessionMode = request.cookies.get("kk_session_mode")?.value ?? "standard";
  if (sessionMode === "remember") {
    return response;
  }

  const lastActivity = Number(request.cookies.get("kk_last_activity")?.value ?? "0");
  const isExpired = !lastActivity || Date.now() - lastActivity > THIRTY_MINUTES_MS;

  if (isExpired) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.cookies.delete("kk_last_activity");
    redirectResponse.cookies.delete("kk_session_mode");
    return redirectResponse;
  }

  response.cookies.set("kk_last_activity", Date.now().toString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
