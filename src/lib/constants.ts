export const OUTLET_NAME = "SM Davao";

export const POSITION_SLOTS = [
  { position: "Manager / Supervisor", slots: 2 },
  { position: "Cook", slots: 1 },
  { position: "Assist Cook", slots: 1 },
  { position: "Chopper", slots: 1 },
  { position: "Kitchen Helper", slots: 3 },
  { position: "Cashier", slots: 1 },
  { position: "Cashier Reliever", slots: 1 },
  { position: "Counter Girl", slots: 5 },
] as const;

export const REQUIRED_SEQUENCE = [
  "am_in",
  "am_signature",
  "break_out",
  "break_signature",
  "pm_in",
  "pm_signature",
  "pm_out",
] as const;

export const RECORD_STATUS = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;
