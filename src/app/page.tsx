import { redirect } from "next/navigation";
import { LoginCard } from "@/components/auth/login-card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#fef3c7,transparent_38%),radial-gradient(circle_at_80%_0%,#fca5a5,transparent_32%),linear-gradient(160deg,#fff7ed_0%,#ffedd5_45%,#fffbeb_100%)] px-4 py-8">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
        <LoginCard />
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#fef3c7,transparent_38%),radial-gradient(circle_at_80%_0%,#fca5a5,transparent_32%),linear-gradient(160deg,#fff7ed_0%,#ffedd5_45%,#fffbeb_100%)] px-4 py-8">
      <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
      <LoginCard />
    </main>
  );
}
