"use client";

import { useMemo, useState } from "react";

import {
  canExecuteStep,
  nextRequiredStep,
  stepLabel,
  submissionAllowed,
} from "@/lib/attendance-sequence";
import { DTR_SEQUENCE } from "@/lib/constants";
import { computeTotalHours, formatHoursLabel, isLate } from "@/lib/time";
import type { AttendanceRecord, AttendanceStep } from "@/lib/types";

type MutableRecord = Pick<
  AttendanceRecord,
  | "am_in"
  | "break_out"
  | "pm_in"
  | "pm_out"
  | "am_signature"
  | "break_signature"
  | "pm_signature"
  | "status"
>;

const INITIAL_RECORD: MutableRecord = {
  am_in: null,
  break_out: null,
  pm_in: null,
  pm_out: null,
  am_signature: false,
  break_signature: false,
  pm_signature: false,
  status: "pending",
};

export function DashboardSequenceCard() {
  const [record, setRecord] = useState<MutableRecord>(INITIAL_RECORD);
  const [message, setMessage] = useState("Start with AM Time In.");

  const hours = useMemo(
    () => computeTotalHours(record.am_in, record.break_out, record.pm_in, record.pm_out),
    [record],
  );

  const late = isLate(record.am_in);
  const required = nextRequiredStep(record);
  const submitState = submissionAllowed(record);

  function nowIso() {
    return new Date().toISOString();
  }

  function handleStep(step: AttendanceStep) {
    if (!canExecuteStep(record, step)) {
      setMessage(`Please complete ${stepLabel(required ?? step)} first.`);
      return;
    }

    const alreadyDone =
      step === "am_signature" || step === "break_signature" || step === "pm_signature"
        ? Boolean(record[step])
        : Boolean(record[step]);

    if (alreadyDone) {
      setMessage("Already recorded.");
      return;
    }

    if (step === "am_signature" || step === "break_signature" || step === "pm_signature") {
      setRecord((current) => ({ ...current, [step]: true }));
    } else {
      setRecord((current) => ({ ...current, [step]: nowIso() }));
    }

    setMessage(`${stepLabel(step)} captured.`);
  }

  function submitRecord() {
    if (!submitState.ok) {
      setMessage(submitState.reason);
      return;
    }

    setRecord((current) => ({ ...current, status: "submitted" }));
    setMessage("Record submitted for admin review.");
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#2f2318]">Today&apos;s 7-Step Time Entry</h2>
        <span className="rounded-full bg-[#ffe7bc] px-3 py-1 text-xs font-semibold text-[#8f5b00]">
          NO SIGNATURE, NO PAY
        </span>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DTR_SEQUENCE.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => handleStep(step)}
            className="min-h-11 rounded-xl border border-line px-3 py-3 text-left text-sm font-medium transition hover:bg-[#fff9f0]"
          >
            {index + 1}. {stepLabel(step)}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricTile label="Status" value={late ? "Late" : "Present"} tone={late ? "amber" : "green"} />
        <MetricTile label="Total Hours" value={formatHoursLabel(hours)} tone="neutral" />
        <MetricTile label="Record" value={record.status} tone="neutral" />
      </div>

      <p className="mt-4 text-sm text-[#7a3028]">{message}</p>

      <button
        type="button"
        onClick={submitRecord}
        className="mt-4 min-h-11 rounded-xl bg-[#2f6d62] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24554d]"
      >
        Submit Record
      </button>
    </section>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "neutral";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#e6f6ef] text-[#11623e]"
      : tone === "amber"
        ? "bg-[#ffefcf] text-[#8f5b00]"
        : "bg-[#f4efe8] text-[#3f372f]";

  return (
    <article className={`rounded-xl p-3 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </article>
  );
}
