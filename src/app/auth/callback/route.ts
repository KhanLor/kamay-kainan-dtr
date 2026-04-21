import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    }

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const metadata = user.user_metadata ?? {};
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: metadata.full_name ?? metadata.name ?? user.email ?? "Employee",
          position: metadata.position ?? "Counter Girl",
          outlet: metadata.outlet ?? "SM Davao",
          role: "employee",
        });
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
