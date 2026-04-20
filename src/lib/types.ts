export type AppRole = "employee" | "admin";

export type AttendanceStep =
  | "am_in"
  | "am_signature"
  | "break_out"
  | "break_signature"
  | "pm_in"
  | "pm_signature"
  | "pm_out";

export type DtrStatus = "pending" | "submitted" | "approved" | "rejected";

export type AttendanceRecord = {
  id: string;
  user_id: string;
  date: string;
  outlet: string;
  position: string;
  slot: number;
  am_in: string | null;
  break_out: string | null;
  pm_in: string | null;
  pm_out: string | null;
  am_signature: boolean;
  break_signature: boolean;
  pm_signature: boolean;
  total_hours: number | null;
  status: DtrStatus;
  is_late: boolean;
  checked_by: string | null;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  role: AppRole;
  position: string;
  outlet: string;
};
