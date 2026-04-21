"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { computeTotalHours, formatTimeLabel } from "@/lib/utils";
import type { AttendanceRecord } from "@/lib/types";

type StepKey =
  | "am_in"
  | "am_signature"
  | "break_out"
  | "break_signature"
  | "pm_in"
  | "pm_signature"
  | "pm_out";

interface Props {
  record: AttendanceRecord;
}

const steps: Array<{ key: StepKey; label: string; signature?: boolean }> = [
  { key: "am_in", label: "AM Time In" },
  { key: "am_signature", label: "AM Signature", signature: true },
  { key: "break_out", label: "Break Out" },
  { key: "break_signature", label: "Break Signature", signature: true },
  { key: "pm_in", label: "PM Time In" },
  { key: "pm_signature", label: "PM Signature", signature: true },
  { key: "pm_out", label: "PM Time Out" },
];

function getMissingStep(record: AttendanceRecord, step: StepKey): string | null {
  if (step === "am_signature" && !record.am_in) return "AM Time In";
  if (step === "break_out" && !record.am_signature) return "AM Signature";
  if (step === "break_signature" && !record.break_out) return "Break Out";
  if (step === "pm_in" && !record.break_signature) return "Break Signature";
  if (step === "pm_signature" && !record.pm_in) return "PM Time In";
  if (step === "pm_out" && !record.pm_signature) return "PM Signature";
  return null;
}

export function DtrSequenceCard({ record }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [localRecord, setLocalRecord] = useState(record);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function applyStep(step: StepKey) {
    if (!supabase) {
      setError("Supabase is not configured. Please check environment variables.");
      return;
    }

    setNotice(null);
    setError(null);

    const prerequisite = getMissingStep(localRecord, step);
    if (prerequisite) {
      setError(`Please complete ${prerequisite} first`);
      return;
    }

    const alreadyDone =
      (step === "am_in" && !!localRecord.am_in) ||
      (step === "am_signature" && localRecord.am_signature) ||
      (step === "break_out" && !!localRecord.break_out) ||
      (step === "break_signature" && localRecord.break_signature) ||
      (step === "pm_in" && !!localRecord.pm_in) ||
      (step === "pm_signature" && localRecord.pm_signature) ||
      (step === "pm_out" && !!localRecord.pm_out);

    if (alreadyDone) {
      setError("Already recorded");
      return;
    }

    startTransition(async () => {
      const now = new Date().toISOString();
      const payload: Partial<AttendanceRecord> = {};

      if (step === "am_in") payload.am_in = now;
      if (step === "am_signature") payload.am_signature = true;
      if (step === "break_out") payload.break_out = now;
      if (step === "break_signature") payload.break_signature = true;
      if (step === "pm_in") payload.pm_in = now;
      if (step === "pm_signature") payload.pm_signature = true;
      if (step === "pm_out") payload.pm_out = now;

      const { data, error: updateError } = await supabase
        .from("attendance")
        .update(payload)
        .eq("id", localRecord.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setLocalRecord(data as AttendanceRecord);
      setNotice(`${steps.find((item) => item.key === step)?.label} recorded at ${format(new Date(), "h:mm a")}`);
    });
  }

  async function submitRecord() {
    if (!supabase) {
      setError("Supabase is not configured. Please check environment variables.");
      return;
    }

    setNotice(null);
    setError(null);

    if (!localRecord.am_signature || !localRecord.break_signature || !localRecord.pm_signature) {
      setError("All signatures required before submission");
      return;
    }

    if (!localRecord.pm_out) {
      setError("Please complete PM Time Out first");
      return;
    }

    const { data, error: submitError } = await supabase
      .from("attendance")
      .update({ status: "Submitted" })
      .eq("id", localRecord.id)
      .select()
      .single();

    if (submitError) {
      setError(submitError.message);
      return;
    }

    setLocalRecord(data as AttendanceRecord);
    setNotice("Record submitted for admin approval");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Today&apos;s Time Entry</h2>
          <p className="text-sm text-slate-600">No Signature, No Pay</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {localRecord.status}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((step) => {
          const done =
            (step.key === "am_in" && !!localRecord.am_in) ||
            (step.key === "am_signature" && localRecord.am_signature) ||
            (step.key === "break_out" && !!localRecord.break_out) ||
            (step.key === "break_signature" && localRecord.break_signature) ||
            (step.key === "pm_in" && !!localRecord.pm_in) ||
            (step.key === "pm_signature" && localRecord.pm_signature) ||
            (step.key === "pm_out" && !!localRecord.pm_out);

          const value =
            step.key === "am_in"
              ? formatTimeLabel(localRecord.am_in)
              : step.key === "break_out"
                ? formatTimeLabel(localRecord.break_out)
                : step.key === "pm_in"
                  ? formatTimeLabel(localRecord.pm_in)
                  : step.key === "pm_out"
                    ? formatTimeLabel(localRecord.pm_out)
                    : done
                      ? "Signed"
                      : "--";

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => applyStep(step.key)}
              disabled={pending || localRecord.status !== "Pending"}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                done
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <p className="text-sm font-semibold text-slate-900">{step.label}</p>
              <p className="text-xs text-slate-600">{value}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">Total: {computeTotalHours(localRecord)}</p>
        <button
          type="button"
          onClick={submitRecord}
          disabled={pending || localRecord.status !== "Pending"}
          className="h-11 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit Record
        </button>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      {notice ? <p className="mt-3 text-sm font-semibold text-emerald-700">{notice}</p> : null}
    </section>
  );
}
