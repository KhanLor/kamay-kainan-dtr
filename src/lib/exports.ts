import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import type { AttendanceRecord } from "@/lib/types";
import { formatHoursLabel, toTimeValue } from "@/lib/time";

function exportRows(records: AttendanceRecord[]) {
  return records.map((row) => ({
    Position: row.position,
    Name: row.user_id,
    Slot: row.slot,
    "AM In": toTimeValue(row.am_in),
    "AM Sig": row.am_signature ? "Signed" : "--",
    "Break Out": toTimeValue(row.break_out),
    "Break Sig": row.break_signature ? "Signed" : "--",
    "PM In": toTimeValue(row.pm_in),
    "PM Sig": row.pm_signature ? "Signed" : "--",
    "PM Out": toTimeValue(row.pm_out),
    "Total Hours": formatHoursLabel(row.total_hours),
    Status: row.status,
    "Checked By": row.checked_by ?? "--",
  }));
}

export function filenameFor(dateIso: string, ext: "csv" | "xlsx" | "pdf") {
  return `DTR_SM_DAVAO_${dateIso}.${ext}`;
}

export function toCsv(records: AttendanceRecord[], dateIso: string) {
  const ws = XLSX.utils.json_to_sheet(exportRows(records));
  const csv = XLSX.utils.sheet_to_csv(ws);
  return {
    filename: filenameFor(dateIso, "csv"),
    content: csv,
  };
}

export function toXlsx(records: AttendanceRecord[], dateIso: string) {
  const wb = XLSX.utils.book_new();
  const detail = XLSX.utils.json_to_sheet(exportRows(records));
  XLSX.utils.book_append_sheet(wb, detail, "Details");

  const summary = XLSX.utils.json_to_sheet([
    {
      date: dateIso,
      total_records: records.length,
      submitted: records.filter((r) => r.status === "submitted").length,
      approved: records.filter((r) => r.status === "approved").length,
      pending: records.filter((r) => r.status === "pending").length,
    },
  ]);
  XLSX.utils.book_append_sheet(wb, summary, "Summary");

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return {
    filename: filenameFor(dateIso, "xlsx"),
    content: buffer,
  };
}

export function toPdf(records: AttendanceRecord[], dateIso: string) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  doc.setFontSize(14);
  doc.text("Kamay Kainan DTR - SM Davao", 14, 14);
  doc.setFontSize(10);
  doc.text(`Date: ${dateIso}`, 14, 20);

  autoTable(doc, {
    startY: 26,
    head: [["Position", "Name", "AM In", "Break Out", "PM In", "PM Out", "Total", "Status", "Checked By"]],
    body: records.map((r) => [
      r.position,
      r.user_id,
      toTimeValue(r.am_in),
      toTimeValue(r.break_out),
      toTimeValue(r.pm_in),
      toTimeValue(r.pm_out),
      formatHoursLabel(r.total_hours),
      r.status,
      r.checked_by ?? "--",
    ]),
    styles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  return {
    filename: filenameFor(dateIso, "pdf"),
    content: doc.output("arraybuffer"),
  };
}
