"use client";

import { toCsv, toPdf, toXlsx } from "@/lib/exports";
import type { AttendanceRecord } from "@/lib/types";

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportActions({ records, dateIso }: { records: AttendanceRecord[]; dateIso: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          const result = toCsv(records, dateIso);
          downloadBlob(result.content, result.filename, "text/csv;charset=utf-8;");
        }}
        className="rounded-lg border border-line bg-[#fff8ee] px-3 py-2 text-xs font-semibold text-[#3f372f]"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => {
          const result = toXlsx(records, dateIso);
          downloadBlob(result.content, result.filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }}
        className="rounded-lg border border-line bg-[#fff8ee] px-3 py-2 text-xs font-semibold text-[#3f372f]"
      >
        Export Excel
      </button>
      <button
        type="button"
        onClick={() => {
          const result = toPdf(records, dateIso);
          downloadBlob(result.content, result.filename, "application/pdf");
        }}
        className="rounded-lg border border-line bg-[#fff8ee] px-3 py-2 text-xs font-semibold text-[#3f372f]"
      >
        Export PDF
      </button>
    </div>
  );
}
