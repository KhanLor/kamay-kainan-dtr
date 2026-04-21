import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { AttendanceRecord, UserProfile } from "@/lib/types";

export interface ExportRow {
  position: string;
  name: string;
  slot: number;
  am_in: string;
  am_sig: string;
  break_out: string;
  break_sig: string;
  pm_in: string;
  pm_sig: string;
  pm_out: string;
  total_hours: number;
  status: string;
  checked_by: string;
}

function dateTimeLabel(value: string | null): string {
  return value ? format(new Date(value), "h:mm a") : "";
}

export function buildExportRows(rows: Array<AttendanceRecord & { profile?: UserProfile | null }>): ExportRow[] {
  return rows.map((row, index) => ({
    position: row.profile?.position ?? "",
    name: row.profile?.full_name ?? "",
    slot: index + 1,
    am_in: dateTimeLabel(row.am_in),
    am_sig: row.am_signature ? "Signed" : "-",
    break_out: dateTimeLabel(row.break_out),
    break_sig: row.break_signature ? "Signed" : "-",
    pm_in: dateTimeLabel(row.pm_in),
    pm_sig: row.pm_signature ? "Signed" : "-",
    pm_out: dateTimeLabel(row.pm_out),
    total_hours: row.total_hours ?? 0,
    status: row.status,
    checked_by: row.checked_by ?? "",
  }));
}

export function buildCsv(rows: ExportRow[]): string {
  const headers = [
    "Position",
    "Name",
    "Slot",
    "AM In",
    "AM Sig",
    "Break Out",
    "Break Sig",
    "PM In",
    "PM Sig",
    "PM Out",
    "Total Hours",
    "Status",
    "Checked By",
  ];

  const lines = rows.map((row) =>
    [
      row.position,
      row.name,
      String(row.slot),
      row.am_in,
      row.am_sig,
      row.break_out,
      row.break_sig,
      row.pm_in,
      row.pm_sig,
      row.pm_out,
      String(row.total_hours),
      row.status,
      row.checked_by,
    ]
      .map((item) => `"${String(item).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...lines].join("\n");
}

export function buildXlsx(rows: ExportRow[]): Uint8Array {
  const detailSheet = XLSX.utils.json_to_sheet(rows);
  const summary = [
    { key: "Total Records", value: rows.length },
    { key: "Submitted", value: rows.filter((row) => row.status === "Submitted").length },
    { key: "Approved", value: rows.filter((row) => row.status === "Approved").length },
    { key: "Rejected", value: rows.filter((row) => row.status === "Rejected").length },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summary);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, detailSheet, "Details");

  const arrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(arrayBuffer);
}

export function buildPdf(rows: ExportRow[]): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text("Kamay Kainan DTR - SM Davao", 10, 10);
  doc.setFontSize(10);
  doc.text("NO SIGNATURE, NO PAY!", 10, 16);

  autoTable(doc, {
    startY: 20,
    head: [["Position", "Name", "AM In", "Break Out", "PM In", "PM Out", "Hours", "Status"]],
    body: rows.map((row) => [
      row.position,
      row.name,
      row.am_in,
      row.break_out,
      row.pm_in,
      row.pm_out,
      row.total_hours,
      row.status,
    ]),
    styles: {
      fontSize: 8,
    },
  });

  return new Uint8Array(doc.output("arraybuffer"));
}
