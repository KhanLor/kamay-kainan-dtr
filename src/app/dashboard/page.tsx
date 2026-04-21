import { format } from "date-fns";
import { redirect } from "next/navigation";
import { AdminQueue } from "@/components/admin/admin-queue";
import { ExportActions } from "@/components/admin/export-actions";
import { DtrSequenceCard } from "@/components/dashboard/dtr-sequence-card";
import { PaperDtrView } from "@/components/dashboard/paper-dtr-view";
import { SignOutMenu } from "@/components/dashboard/sign-out-menu";
import { RECORD_STATUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { computeTotalHours, deriveAttendanceStatus } from "@/lib/utils";
import type { AttendanceRecord, UserProfile } from "@/lib/types";

function createDefaultRecord(userId: string): Omit<AttendanceRecord, "id" | "created_at" | "updated_at"> {
  return {
    user_id: userId,
    date: format(new Date(), "yyyy-MM-dd"),
    outlet: "SM Davao",
    am_in: null,
    break_out: null,
    pm_in: null,
    pm_out: null,
    am_signature: false,
    break_signature: false,
    pm_signature: false,
    total_hours: null,
    status: RECORD_STATUS.PENDING,
    is_late: false,
    checked_by: null,
    checked_at: null,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as UserProfile | null;

  if (!profile) {
    redirect("/");
  }

  const today = format(new Date(), "yyyy-MM-dd");

  let { data: todayRecord } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  if (!todayRecord) {
    const { data: created } = await supabase
      .from("attendance")
      .insert(createDefaultRecord(user.id))
      .select()
      .single();

    todayRecord = created;
  }

  const record = todayRecord as AttendanceRecord;
  const status = deriveAttendanceStatus(record);
  const totalHours = computeTotalHours(record);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
      <nav className="mb-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Kamay Kainan</p>
          <h1 className="text-xl font-black text-slate-900">Daily Time Record Dashboard</h1>
        </div>
        <SignOutMenu fullName={profile.full_name} />
      </nav>

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Status</p>
          <p className={`mt-1 text-2xl font-bold ${status === "Present" ? "text-emerald-600" : status === "Late" ? "text-amber-600" : "text-red-600"}`}>
            {status}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Total Hours</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalHours}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Record</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{record.status}</p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DtrSequenceCard record={record} />
        <PaperDtrView profile={profile} record={record} />
      </section>

      {profile.role === "admin" ? (
        <div className="mt-5 space-y-5">
          <ExportActions />
          <AdminQueue />
        </div>
      ) : null}
    </main>
  );
}
