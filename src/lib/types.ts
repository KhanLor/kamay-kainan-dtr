export type AppRole = "employee" | "admin";

export type AttendanceStatus = "Present" | "Late" | "Absent";

export type RecordState = "Pending" | "Submitted" | "Approved" | "Rejected";

export interface UserProfile {
  id: string;
  full_name: string;
  position: string;
  outlet: string;
  role: AppRole;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  outlet: string;
  am_in: string | null;
  break_out: string | null;
  pm_in: string | null;
  pm_out: string | null;
  am_signature: boolean;
  break_signature: boolean;
  pm_signature: boolean;
  total_hours: number | null;
  status: RecordState;
  is_late: boolean;
  checked_by: string | null;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
}
