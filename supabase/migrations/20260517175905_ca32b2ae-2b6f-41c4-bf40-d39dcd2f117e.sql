
alter table public.uploads
  add column if not exists solution_url text,
  add column if not exists solution_path text,
  add column if not exists solution_name text;
