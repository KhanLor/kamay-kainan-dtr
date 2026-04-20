import { ExportActions } from "@/components/export-actions";
import type { AttendanceRecord } from "@/lib/types";

type QueueRecord = {
  id: string;
  date: string;
  position: string;
  status: "submitted" | "approved" | "rejected";
  employee: string;
};

const MOCK_QUEUE: QueueRecord[] = [
  { id: "1", date: "2026-04-20", position: "Counter Girl", status: "submitted", employee: "Employee 01" },
  { id: "2", date: "2026-04-20", position: "Kitchen Helper", status: "submitted", employee: "Employee 02" },
  { id: "3", date: "2026-04-19", position: "Cook", status: "approved", employee: "Employee 03" },
];

const MOCK_EXPORT_ROWS: AttendanceRecord[] = [
  {
    id: "row-1",
    user_id: "Employee 01",
    date: "2026-04-20",
    outlet: "SM Davao",
    position: "Counter Girl",
    slot: 1,
    am_in: "2026-04-20T08:03:00.000Z",
    break_out: "2026-04-20T12:00:00.000Z",
    pm_in: "2026-04-20T13:05:00.000Z",
    pm_out: "2026-04-20T17:10:00.000Z",
    am_signature: true,
    break_signature: true,
    pm_signature: true,
    total_hours: 8.03,
    status: "submitted",
    is_late: true,
    checked_by: null,
    checked_at: null,
    created_at: "2026-04-20T07:58:00.000Z",
    updated_at: "2026-04-20T17:10:00.000Z",
  },
];

export function AdminQueue() {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#2f2318]">Approval Queue</h2>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-[#665646]">Checked By signature equivalent is logged on approval.</p>
          <ExportActions records={MOCK_EXPORT_ROWS} dateIso="2026-04-20" />
        </div>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input type="date" className="h-11 rounded-xl border border-line px-3 text-sm" />
        <select className="h-11 rounded-xl border border-line px-3 text-sm">
          <option value="">All positions</option>
          <option>Manager / Supervisor</option>
          <option>Cook</option>
          <option>Assist Cook</option>
          <option>Chopper</option>
          <option>Kitchen Helper</option>
          <option>Cashier</option>
          <option>Cashier Reliever</option>
          <option>Counter Girl</option>
        </select>
        <select className="h-11 rounded-xl border border-line px-3 text-sm">
          <option value="">All statuses</option>
          <option>submitted</option>
          <option>approved</option>
          <option>rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f6eee2] text-left">
              <th className="border border-line p-2">Date</th>
              <th className="border border-line p-2">Employee</th>
              <th className="border border-line p-2">Position</th>
              <th className="border border-line p-2">Status</th>
              <th className="border border-line p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUEUE.map((row) => (
              <tr key={row.id}>
                <td className="border border-line p-2">{row.date}</td>
                <td className="border border-line p-2">{row.employee}</td>
                <td className="border border-line p-2">{row.position}</td>
                <td className="border border-line p-2 capitalize">{row.status}</td>
                <td className="border border-line p-2">
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-[#2f6d62] px-3 py-1.5 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button className="rounded-lg border border-[#c39d74] bg-[#fff7eb] px-3 py-1.5 text-xs font-semibold text-[#7a3028]">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
