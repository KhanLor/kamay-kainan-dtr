import { POSITION_SLOTS } from "@/lib/constants";

export function PaperDtrTable() {
  const rows = POSITION_SLOTS.flatMap((group) =>
    Array.from({ length: group.slots }, (_, index) => ({
      position: group.position,
      slot: index + 1,
    })),
  );

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[#2f2318]">Paper DTR Replica - SM Davao</h2>
        <p className="text-sm text-[#55463b]">Exact position slot count with signature placeholders.</p>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#f6eee2] text-left">
              <th className="border border-line p-2">Position</th>
              <th className="border border-line p-2">Slot</th>
              <th className="border border-line p-2">Name</th>
              <th className="border border-line p-2">AM In</th>
              <th className="border border-line p-2">AM Sig</th>
              <th className="border border-line p-2">Break Out</th>
              <th className="border border-line p-2">Break Sig</th>
              <th className="border border-line p-2">PM In</th>
              <th className="border border-line p-2">PM Sig</th>
              <th className="border border-line p-2">PM Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.position}-${row.slot}`}>
                <td className="border border-line p-2">{row.position}</td>
                <td className="border border-line p-2">{row.slot}</td>
                <td className="border border-line p-2">-</td>
                <td className="border border-line p-2">--:--</td>
                <td className="border border-line p-2">-</td>
                <td className="border border-line p-2">--:--</td>
                <td className="border border-line p-2">-</td>
                <td className="border border-line p-2">--:--</td>
                <td className="border border-line p-2">-</td>
                <td className="border border-line p-2">--:--</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-[#7a3028]">
        <p>NO SIGNATURE, NO PAY!</p>
        <p className="text-[#3f372f]">CHECKED BY: ____________________</p>
      </footer>
    </section>
  );
}
