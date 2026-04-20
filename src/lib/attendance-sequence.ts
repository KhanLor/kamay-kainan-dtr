import { DTR_SEQUENCE } from "@/lib/constants";
import type { AttendanceRecord, AttendanceStep } from "@/lib/types";

function isCompleted(record: Partial<AttendanceRecord>, step: AttendanceStep): boolean {
  if (step === "am_signature" || step === "break_signature" || step === "pm_signature") {
    return Boolean(record[step]);
  }

  return Boolean(record[step]);
}

export function nextRequiredStep(record: Partial<AttendanceRecord>): AttendanceStep | null {
  for (const step of DTR_SEQUENCE) {
    if (!isCompleted(record, step)) {
      return step;
    }
  }

  return null;
}

export function canExecuteStep(record: Partial<AttendanceRecord>, step: AttendanceStep): boolean {
  const next = nextRequiredStep(record);
  return next === step;
}

export function signatureComplete(record: Partial<AttendanceRecord>): boolean {
  return Boolean(record.am_signature && record.break_signature && record.pm_signature);
}

export function submissionAllowed(record: Partial<AttendanceRecord>): { ok: boolean; reason: string } {
  const next = nextRequiredStep(record);
  if (next !== null) {
    return { ok: false, reason: `Please complete ${stepLabel(next)} first.` };
  }

  if (!signatureComplete(record)) {
    return { ok: false, reason: "All signatures required before submission." };
  }

  return { ok: true, reason: "Ready for submission." };
}

export function stepLabel(step: AttendanceStep): string {
  const labels: Record<AttendanceStep, string> = {
    am_in: "AM Time In",
    am_signature: "AM Signature",
    break_out: "Break Out",
    break_signature: "Break Signature",
    pm_in: "PM Time In",
    pm_signature: "PM Signature",
    pm_out: "PM Time Out",
  };

  return labels[step];
}
