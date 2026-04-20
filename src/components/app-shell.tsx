import Link from "next/link";

import type { AppRole, Profile } from "@/lib/types";

export function AppShell({
  role,
  profile,
  children,
}: {
  role: AppRole;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/paper-dtr", label: "Paper DTR" },
  ];

  if (role === "admin") {
    links.push({ href: "/admin", label: "Admin" });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <header className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8f5b00]">Kamay Kainan</p>
            <h1 className="text-xl font-bold text-[#2f2318]">DTR System - SM Davao</h1>
          </div>
          <div className="text-right text-sm text-[#55463b]">
            <p className="font-semibold">{profile?.full_name ?? "Unnamed user"}</p>
            <p className="capitalize">{profile?.role ?? role}</p>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-line bg-[#fff8ee] px-3 py-2 text-sm font-semibold text-[#3f372f] transition hover:bg-[#fbeccf]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-[#3f372f] transition hover:bg-[#f5eee6]"
          >
            Switch Account
          </Link>
        </nav>
      </header>

      {children}
    </main>
  );
}
