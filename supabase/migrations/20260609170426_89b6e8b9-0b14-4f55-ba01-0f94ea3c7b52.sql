
-- 1) Restrict profiles SELECT to owner + admin (was: public to everyone)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) Tighten profile UPDATE: prevent users from changing their own points
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND points = (SELECT p.points FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3) Public leaderboard view with safe columns only
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, points, department, semester, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Allow the view itself to read profile rows regardless of caller's RLS
CREATE POLICY "Public leaderboard read"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (false);

-- Above is a placeholder denying direct row reads to anon by default.
-- Instead, expose data only via the view by switching it to a SECURITY DEFINER function-style view:
DROP POLICY IF EXISTS "Public leaderboard read" ON public.profiles;

-- Re-create the view as SECURITY DEFINER (owner bypasses RLS) limited to safe columns
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, points, department, semester, created_at
FROM public.profiles;
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4) Tighten uploads UPDATE: users may only edit their own and cannot change status or downloads
DROP POLICY IF EXISTS "Users can update own uploads" ON public.uploads;

CREATE POLICY "Users can update own uploads"
  ON public.uploads FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND downloads = (SELECT u.downloads FROM public.uploads u WHERE u.id = uploads.id)
  );
