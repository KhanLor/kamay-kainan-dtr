import { format, isAfter, parseISO } from "date-fns";

import { LATE_CUTOFF_HOUR } from "@/lib/constants";

export function computeTotalHours(
  amIn: string | null,
  breakOut: string | null,
  pmIn: string | null,
  pmOut: string | null,
): number | null {
  if (!amIn || !breakOut || !pmIn || !pmOut) {
    return null;
  }

  const amDurationMs = parseISO(breakOut).getTime() - parseISO(amIn).getTime();
  const pmDurationMs = parseISO(pmOut).getTime() - parseISO(pmIn).getTime();
  const totalMs = amDurationMs + pmDurationMs;

  if (Number.isNaN(totalMs) || totalMs < 0) {
    return null;
  }

  return Number((totalMs / 3_600_000).toFixed(2));
}

export function formatHoursLabel(hours: number | null): string {
  if (hours === null) {
    return "0 hours 00 minutes";
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours} hours ${String(minutes).padStart(2, "0")} minutes`;
}

export function isLate(amIn: string | null): boolean {
  if (!amIn) {
    return false;
  }

  const date = parseISO(amIn);
  const cutoff = new Date(date);
  cutoff.setHours(LATE_CUTOFF_HOUR, 0, 0, 0);
  return isAfter(date, cutoff);
}

export function toTimeValue(isoTimestamp: string | null): string {
  if (!isoTimestamp) {
    return "--:--";
  }

  return format(parseISO(isoTimestamp), "hh:mm a");
}
