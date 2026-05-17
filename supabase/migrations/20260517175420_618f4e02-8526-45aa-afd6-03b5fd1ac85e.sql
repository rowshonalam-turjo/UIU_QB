
-- Uploads table
create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course_code text not null,
  department text,
  type text not null,
  trimester text,
  teacher text,
  description text,
  file_url text not null,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  status text not null default 'pending',
  downloads int not null default 0,
  likes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index uploads_user_id_idx on public.uploads(user_id);
create index uploads_status_idx on public.uploads(status);

alter table public.uploads enable row level security;

create policy "Approved uploads viewable by everyone"
  on public.uploads for select
  using (status = 'approved' or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users can insert own uploads"
  on public.uploads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own uploads"
  on public.uploads for update
  using (auth.uid() = user_id);

create policy "Admins can update any upload"
  on public.uploads for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can delete own uploads"
  on public.uploads for delete
  using (auth.uid() = user_id);

create policy "Admins can delete any upload"
  on public.uploads for delete
  using (public.has_role(auth.uid(), 'admin'));

create trigger uploads_set_updated_at
  before update on public.uploads
  for each row execute function public.touch_updated_at();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('questions', 'questions', true)
  on conflict (id) do nothing;

-- Avatars policies
create policy "Avatar files publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Questions policies
create policy "Question files publicly readable"
  on storage.objects for select
  using (bucket_id = 'questions');

create policy "Users can upload own question files"
  on storage.objects for insert
  with check (bucket_id = 'questions' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own question files"
  on storage.objects for update
  using (bucket_id = 'questions' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own question files"
  on storage.objects for delete
  using (bucket_id = 'questions' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins manage all storage"
  on storage.objects for all
  using (public.has_role(auth.uid(), 'admin'));
