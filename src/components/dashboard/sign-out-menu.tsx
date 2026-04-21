"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  fullName: string;
}

export function SignOutMenu({ fullName }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);

  async function onSignOut() {
    const shouldSignOut = window.confirm("Are you sure you want to sign out?");
    if (!shouldSignOut) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm"
      >
        {fullName}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
