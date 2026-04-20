import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const session =
    supabase
      ? (
          await supabase.auth.getSession()
        ).data.session
      : null;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(80rem_35rem_at_10%_0%,#f7d49b_0%,transparent_70%),radial-gradient(60rem_30rem_at_90%_100%,#b8d9d1_0%,transparent_60%)]" />
      <section className="relative mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl border border-line bg-white/85 p-8 backdrop-blur sm:p-12">
        <p className="w-fit rounded-full border border-[#d5b986] bg-[#fff3d9] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8f5b00]">
          SM Davao Outlet
        </p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight text-[#2f2318] sm:text-5xl">
          Kamay Kainan Daily Time Record System
        </h1>
        <p className="max-w-2xl text-base text-[#55463b] sm:text-lg">
          Paper-accurate DTR flow with signature enforcement, approval queue, and export-ready records.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-[#2f6d62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24554d]"
          >
            Sign in to Continue
          </Link>
          <Link
            href="/paper-dtr"
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-[#3f372f] transition hover:bg-[#fff8ee]"
          >
            View Paper DTR Layout
          </Link>
        </div>
      </section>
    </main>
  );
}
