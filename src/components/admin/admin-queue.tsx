import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function AdminQueue() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("attendance")
    .select("id, date, status, total_hours, is_late, profiles:profiles!attendance_user_id_fkey(full_name,position)")
    .in("status", ["Submitted", "Approved", "Rejected"])
    .order("date", { ascending: false })
    .limit(20);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Admin Approval Queue</h2>
      <p className="mb-4 text-sm text-slate-600">Recent submitted records for review and approval</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-600">
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Position</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Late</th>
              <th className="px-2 py-2">Hours</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-b border-slate-100 text-slate-800">
                <td className="px-2 py-2">{format(new Date(row.date), "MMM d, yyyy")}</td>
                <td className="px-2 py-2">{(row.profiles as { full_name?: string } | null)?.full_name ?? "-"}</td>
                <td className="px-2 py-2">{(row.profiles as { position?: string } | null)?.position ?? "-"}</td>
                <td className="px-2 py-2">{row.status}</td>
                <td className="px-2 py-2">{row.is_late ? "Yes" : "No"}</td>
                <td className="px-2 py-2">{row.total_hours ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
