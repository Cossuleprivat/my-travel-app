-- Phase E: Data Ops + Quality

create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  display_name text not null,
  license text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources(id) on delete restrict,
  entity_type text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  initiated_by uuid references auth.users(id) on delete set null,
  records_read integer not null default 0,
  records_inserted integer not null default 0,
  records_updated integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint import_jobs_status_valid check (status in ('running', 'completed', 'failed', 'cancelled'))
);

create table if not exists public.import_errors (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  record_ref text,
  error_code text not null,
  error_message text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.quest_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete restrict,
  title text not null,
  description text,
  category public.quest_category not null,
  status text not null default 'pending',
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quest_submission_status_valid check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_import_jobs_source_id on public.import_jobs(source_id);
create index if not exists idx_import_jobs_status on public.import_jobs(status);
create index if not exists idx_import_errors_import_job_id on public.import_errors(import_job_id);
create index if not exists idx_quest_submissions_user_id on public.quest_submissions(user_id);
create index if not exists idx_quest_submissions_city_id on public.quest_submissions(city_id);

drop trigger if exists trg_data_sources_updated_at on public.data_sources;
create trigger trg_data_sources_updated_at
before update on public.data_sources
for each row execute function public.set_updated_at();

drop trigger if exists trg_import_jobs_updated_at on public.import_jobs;
create trigger trg_import_jobs_updated_at
before update on public.import_jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_quest_submissions_updated_at on public.quest_submissions;
create trigger trg_quest_submissions_updated_at
before update on public.quest_submissions
for each row execute function public.set_updated_at();
