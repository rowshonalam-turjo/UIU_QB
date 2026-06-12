
ALTER TABLE public.uploads
  ADD COLUMN IF NOT EXISTS pending_solution_url text,
  ADD COLUMN IF NOT EXISTS pending_solution_path text,
  ADD COLUMN IF NOT EXISTS pending_solution_name text,
  ADD COLUMN IF NOT EXISTS pending_solution_user_id uuid,
  ADD COLUMN IF NOT EXISTS pending_solution_submitted_at timestamptz;

CREATE INDEX IF NOT EXISTS uploads_pending_solution_idx
  ON public.uploads (pending_solution_submitted_at)
  WHERE pending_solution_url IS NOT NULL;
