ALTER TABLE public.uploads
  ADD COLUMN IF NOT EXISTS code_url text,
  ADD COLUMN IF NOT EXISTS code_path text,
  ADD COLUMN IF NOT EXISTS code_name text;