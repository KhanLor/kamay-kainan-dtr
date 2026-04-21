import { format } from "date-fns";
import { NextResponse } from "next/server";
import { buildCsv, buildExportRows, buildPdf, buildXlsx } from "@/lib/exports";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceRecord, UserProfile } from "@/lib/types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const formatType = requestUrl.searchParams.get("format") ?? "csv";
  const date = requestUrl.searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("attendance")
    .select("*, profile:profiles!attendance_user_id_fkey(*)")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedRows = buildExportRows((rows ?? []) as Array<AttendanceRecord & { profile?: UserProfile | null }>);

  if (formatType === "xlsx") {
    const file = buildXlsx(mappedRows);
    const bytes = Uint8Array.from(file);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=DTR_SM_DAVAO_${date}.xlsx`,
      },
    });
  }

  if (formatType === "pdf") {
    const file = buildPdf(mappedRows);
    const bytes = Uint8Array.from(file);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=DTR_SM_DAVAO_${date}.pdf`,
      },
    });
  }

  const csv = buildCsv(mappedRows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=DTR_SM_DAVAO_${date}.csv`,
    },
  });
}

