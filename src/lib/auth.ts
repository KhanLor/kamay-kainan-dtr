import { redirect } from "next/navigation";

import type { AppRole, Profile } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserAndProfile(): Promise<{
  userId: string;
  profile: Profile | null;
}> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, position, outlet")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    profile: (profile as Profile | null) ?? null,
  };
}

export async function requireRole(roles: AppRole[]) {
  const { profile } = await getCurrentUserAndProfile();

  if (!profile || !roles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}
