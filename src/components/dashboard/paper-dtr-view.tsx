import { POSITION_SLOTS } from "@/lib/constants";
import { formatTimeLabel } from "@/lib/utils";
import type { AttendanceRecord, UserProfile } from "@/lib/types";

interface Props {
  profile: UserProfile;
  record: AttendanceRecord;
}

export function PaperDtrView({ profile, record }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-900">Paper DTR View</h2>
        <p className="text-sm text-slate-600">Exact field flow in printable format</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border border-slate-300 px-2 py-2 text-left">Position</th>
              <th className="border border-slate-300 px-2 py-2 text-left">Name</th>
              <th className="border border-slate-300 px-2 py-2 text-left">Slot</th>
              <th className="border border-slate-300 px-2 py-2">AM In</th>
              <th className="border border-slate-300 px-2 py-2">AM Sig</th>
              <th className="border border-slate-300 px-2 py-2">Break Out</th>
              <th className="border border-slate-300 px-2 py-2">Break Sig</th>
              <th className="border border-slate-300 px-2 py-2">PM In</th>
              <th className="border border-slate-300 px-2 py-2">PM Sig</th>
              <th className="border border-slate-300 px-2 py-2">PM Out</th>
            </tr>
          </thead>
          <tbody>
            {POSITION_SLOTS.flatMap((item) =>
              Array.from({ length: item.slots }).map((_, index) => {
                const isUserRow =
                  profile.position.toLowerCase() === item.position.toLowerCase() && index === 0;

                return (
                  <tr key={`${item.position}-${index}`}>
                    <td className="border border-slate-300 px-2 py-1">{item.position}</td>
                    <td className="border border-slate-300 px-2 py-1">{isUserRow ? profile.full_name : ""}</td>
                    <td className="border border-slate-300 px-2 py-1">{index + 1}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? formatTimeLabel(record.am_in) : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? (record.am_signature ? "Signed" : "-") : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? formatTimeLabel(record.break_out) : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? (record.break_signature ? "Signed" : "-") : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? formatTimeLabel(record.pm_in) : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? (record.pm_signature ? "Signed" : "-") : ""}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      {isUserRow ? formatTimeLabel(record.pm_out) : ""}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-800">
        <p>NO SIGNATURE, NO PAY!</p>
        <p>CHECKED BY: _______</p>
      </div>
    </section>
  );
}
