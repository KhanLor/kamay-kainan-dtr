create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  position text not null,
  outlet text not null default 'SM Davao',
  role text not null default 'employee' check (role in ('employee', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  date date not null,
  outlet text not null default 'SM Davao',
  am_in timestamptz,
  break_out timestamptz,
  pm_in timestamptz,
  pm_out timestamptz,
  am_signature boolean not null default false,
  break_signature boolean not null default false,
  pm_signature boolean not null default false,
  total_hours numeric(5,2),
  status text not null default 'Pending' check (status in ('Pending', 'Submitted', 'Approved', 'Rejected')),
  is_late boolean not null default false,
  checked_by uuid references public.profiles(id),
  checked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, date)
);

create table if not exists public.attendance_audit_log (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.compute_total_hours()
returns trigger
language plpgsql
as $$
declare
  am_minutes integer;
  pm_minutes integer;
  total_minutes integer;
begin
  if new.am_in is not null then
    new.is_late = (new.am_in::time > time '08:00:00');
  end if;

  if new.am_in is not null and new.break_out is not null then
    am_minutes = greatest(0, floor(extract(epoch from (new.break_out - new.am_in)) / 60));
  else
    am_minutes = 0;
  end if;

  if new.pm_in is not null and new.pm_out is not null then
    pm_minutes = greatest(0, floor(extract(epoch from (new.pm_out - new.pm_in)) / 60));
  else
    pm_minutes = 0;
  end if;

  total_minutes = am_minutes + pm_minutes;
  new.total_hours = round((total_minutes::numeric / 60), 2);

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_attendance_updated_at on public.attendance;
create trigger trg_attendance_updated_at
before update on public.attendance
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_attendance_compute_hours on public.attendance;
create trigger trg_attendance_compute_hours
before insert or update on public.attendance
for each row
execute function public.compute_total_hours();

alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.attendance_audit_log enable row level security;

drop policy if exists "Profiles owner or admin read" on public.profiles;
create policy "Profiles owner or admin read"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles owner update" on public.profiles;
create policy "Profiles owner update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles insert self" on public.profiles;
create policy "Profiles insert self"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Attendance employee own read" on public.attendance;
create policy "Attendance employee own read"
on public.attendance
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Attendance employee own insert" on public.attendance;
create policy "Attendance employee own insert"
on public.attendance
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Attendance employee update pending" on public.attendance;
create policy "Attendance employee update pending"
on public.attendance
for update
using (auth.uid() = user_id and status = 'Pending')
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Attendance admin update all" on public.attendance;
create policy "Attendance admin update all"
on public.attendance
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Audit admin read" on public.attendance_audit_log;
create policy "Audit admin read"
on public.attendance_audit_log
for select
using (public.is_admin());

drop policy if exists "Audit admin insert" on public.attendance_audit_log;
create policy "Audit admin insert"
on public.attendance_audit_log
for insert
with check (public.is_admin());

create or replace function public.log_attendance_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old is distinct from new then
    insert into public.attendance_audit_log (
      attendance_id,
      changed_by,
      action,
      old_data,
      new_data
    )
    values (
      new.id,
      auth.uid(),
      case
        when new.status = 'Approved' then 'approve'
        when new.status = 'Rejected' then 'reject'
        else 'update'
      end,
      to_jsonb(old),
      to_jsonb(new)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_attendance_audit_log on public.attendance;
create trigger trg_attendance_audit_log
after update on public.attendance
for each row
execute function public.log_attendance_changes();
