# Kamay Kainan DTR System

Digital Daily Time Record system for Kamay Kainan (SM Davao), built with Next.js 14, React 18, Tailwind CSS, and Supabase.

## Implemented Baseline

- Dual authentication flow: Google OAuth and Email/Password
- Direct post-login redirect to dashboard
- Persistent session handling with Supabase auth cookies
- Dashboard with employee metrics: status, total hours, record state
- 7-step DTR sequence with order validation and duplicate prevention
- Digital signature checkpoints (AM/Break/PM)
- Submission rule enforcement: all signatures required
- Paper DTR-style table view with "NO SIGNATURE, NO PAY!"
- Role-aware rendering: employee vs admin dashboard sections
- Admin queue view (recent submitted/approved/rejected records)
- Export endpoints for CSV, Excel, and PDF
- Supabase SQL migration with RLS policies, triggers, and audit log table

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- date-fns
- xlsx (SheetJS)
- jsPDF + jspdf-autotable

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Database Setup

Apply the SQL migration in your Supabase project:

- `supabase/migrations/20260421_init_dtr_schema.sql`

This creates:

- `profiles`
- `attendance`
- `attendance_audit_log`
- RLS policies for employee/admin access control
- Triggers for auto-updated timestamps, total-hour computation, and audit logging

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```

Both commands are passing in the current baseline.

## Notes

- In Supabase Auth, enable Google provider and configure the callback URL to include `/auth/callback`.
- First-time users get a default profile row on callback with outlet set to `SM Davao`.
- Admin access is controlled by `profiles.role = 'admin'`.
