-- Kamay Kainan DTR initial schema
-- Version: 1.0

create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('employee', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.attendance_status as enum ('pending', 'submitted', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  position text not null,
  outlet text not null default 'SM Davao',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  date date not null,
  outlet text not null default 'SM Davao',
  position text not null,
  slot int not null check (slot > 0),
  am_in timestamptz,
  break_out timestamptz,
  pm_in timestamptz,
  pm_out timestamptz,
  am_signature boolean not null default false,
  break_signature boolean not null default false,
  pm_signature boolean not null default false,
  total_hours numeric(5,2),
  status public.attendance_status not null default 'pending',
  is_late boolean not null default false,
  checked_by uuid references auth.users(id),
  checked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date)
);

create table if not exists public.attendance_audit_log (
  id bigserial primary key,
  attendance_id uuid not null references public.attendance(id) on delete cascade,
  changed_by uuid not null references auth.users(id),
  action text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.calculate_total_hours_trigger()
returns trigger
language plpgsql
as $$
declare
  am_hours numeric;
  pm_hours numeric;
  late_cutoff timestamptz;
begin
  if new.am_in is not null and new.break_out is not null then
    am_hours := extract(epoch from (new.break_out - new.am_in)) / 3600.0;
  else
    am_hours := 0;
  end if;

  if new.pm_in is not null and new.pm_out is not null then
    pm_hours := extract(epoch from (new.pm_out - new.pm_in)) / 3600.0;
  else
    pm_hours := 0;
  end if;

  if am_hours < 0 or pm_hours < 0 then
    raise exception 'Invalid time sequence';
  end if;

  if new.am_in is not null then
    late_cutoff := date_trunc('day', new.am_in) + interval '8 hours';
    new.is_late := new.am_in > late_cutoff;
  else
    new.is_late := false;
  end if;

  new.total_hours := round((am_hours + pm_hours)::numeric, 2);
  return new;
end;
$$;

create or replace function public.audit_attendance_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.attendance_audit_log (attendance_id, changed_by, action, new_values)
    values (new.id, auth.uid(), 'insert', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.attendance_audit_log (attendance_id, changed_by, action, old_values, new_values)
    values (new.id, auth.uid(), 'update', to_jsonb(old), to_jsonb(new));
    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_attendance_updated_at on public.attendance;
create trigger trg_attendance_updated_at
before update on public.attendance
for each row
execute function public.set_updated_at();

drop trigger if exists trg_attendance_calculate_hours on public.attendance;
create trigger trg_attendance_calculate_hours
before insert or update on public.attendance
for each row
execute function public.calculate_total_hours_trigger();

drop trigger if exists trg_attendance_audit on public.attendance;
create trigger trg_attendance_audit
after insert or update on public.attendance
for each row
execute function public.audit_attendance_changes();

alter table public.profiles enable row level security;
alter table public.attendance enable row level security;
alter table public.attendance_audit_log enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "attendance_select_own" on public.attendance;
create policy "attendance_select_own"
on public.attendance
for select
using (user_id = auth.uid());

drop policy if exists "attendance_insert_own" on public.attendance;
create policy "attendance_insert_own"
on public.attendance
for insert
with check (user_id = auth.uid());

drop policy if exists "attendance_update_own_pending" on public.attendance;
create policy "attendance_update_own_pending"
on public.attendance
for update
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid() and status in ('pending', 'submitted'));

drop policy if exists "attendance_admin_all" on public.attendance;
create policy "attendance_admin_all"
on public.attendance
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "attendance_audit_admin_only" on public.attendance_audit_log;
create policy "attendance_audit_admin_only"
on public.attendance_audit_log
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
