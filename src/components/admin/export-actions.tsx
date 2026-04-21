"use client";

import { format } from "date-fns";

export function ExportActions() {
  const date = format(new Date(), "yyyy-MM-dd");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Export Reports</h2>
      <p className="mb-4 text-sm text-slate-600">Download DTR reports for {date}</p>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/exports?format=csv&date=${date}`}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
        >
          CSV
        </a>
        <a
          href={`/api/exports?format=xlsx&date=${date}`}
          className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900"
        >
          Excel
        </a>
        <a
          href={`/api/exports?format=pdf&date=${date}`}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          PDF
        </a>
      </div>
    </section>
  );
}
