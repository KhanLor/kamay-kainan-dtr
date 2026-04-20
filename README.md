# Kamay Kainan DTR System

Digital Daily Time Record for Kamay Kainan (SM Davao), built with Next.js 14 + Supabase.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- SheetJS + jsPDF for export formats

## Implemented V1 Baseline

- Login flow with both Google OAuth and email/password paths
- Remember me mode (7 days) and standard inactivity timeout (30 minutes)
- Role-aware protected routes:
	- Employee: Dashboard, Paper DTR
	- Admin: Dashboard, Paper DTR, Admin
- Employee 7-step sequence UI:
	1. AM Time In
	2. AM Signature
	3. Break Out
	4. Break Signature
	5. PM Time In
	6. PM Signature
	7. PM Time Out
- No Signature, No Pay enforcement message and submission validation
- Live total hours computation and late detection (after 8:00 AM)
- Paper DTR replica table with exact 15 slot structure and footer labels
- Admin approval queue shell with date/position/status filters and export buttons
- CSV, Excel, PDF export utility layer with filename convention:
	- DTR_SM_DAVAO_[YYYY-MM-DD].csv
	- DTR_SM_DAVAO_[YYYY-MM-DD].xlsx
	- DTR_SM_DAVAO_[YYYY-MM-DD].pdf
- Supabase migration with:
	- profiles, attendance, attendance_audit_log tables
	- total hour + late trigger
	- audit trigger
	- row-level security policies for employee and admin roles

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env.local
```

3. Fill values in .env.local:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

4. Apply SQL migration in your Supabase project:

- File: supabase/migrations/20260420_initial_dtr.sql

5. Run development server:

```bash
npm run dev
```

## Project Structure

- src/app/login/page.tsx: Login page with Google + email flows
- src/app/(protected)/dashboard/page.tsx: Employee DTR workflow UI
- src/app/(protected)/paper-dtr/page.tsx: Paper-form replica view
- src/app/(protected)/admin/page.tsx: Admin queue page
- src/middleware.ts: Session update + inactivity enforcement
- src/lib/attendance-sequence.ts: 7-step order and submission checks
- src/lib/time.ts: Hours and late computations
- src/lib/exports.ts: CSV/XLSX/PDF generation
- supabase/migrations/20260420_initial_dtr.sql: DB schema + RLS

## Notes

- The current UI is a complete functional baseline; production integration should wire components to live Supabase records (instead of mock queue values on admin screen).
- RLS policies enforce employee-only access to own attendance rows and admin access to all rows.
