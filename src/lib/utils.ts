import { format, isValid, parseISO } from "date-fns";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

export function formatTimeLabel(value: string | null): string {
  if (!value) {
    return "--";
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "h:mm a") : "--";
}

export function computeTotalHours(record: AttendanceRecord): string {
  if (!record.am_in || !record.break_out || !record.pm_in || !record.pm_out) {
    return "0 hours 0 minutes";
  }

  const amIn = parseISO(record.am_in).getTime();
  const breakOut = parseISO(record.break_out).getTime();
  const pmIn = parseISO(record.pm_in).getTime();
  const pmOut = parseISO(record.pm_out).getTime();

  const amMs = Math.max(0, breakOut - amIn);
  const pmMs = Math.max(0, pmOut - pmIn);
  const totalMinutes = Math.floor((amMs + pmMs) / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} hours ${minutes} minutes`;
}

export function deriveAttendanceStatus(record: AttendanceRecord): AttendanceStatus {
  if (!record.am_in) {
    return "Absent";
  }

  if (record.is_late) {
    return "Late";
  }

  return "Present";
}

export function canSubmitRecord(record: AttendanceRecord): boolean {
  return (
    !!record.am_in &&
    !!record.break_out &&
    !!record.pm_in &&
    !!record.pm_out &&
    record.am_signature &&
    record.break_signature &&
    record.pm_signature
  );
}
