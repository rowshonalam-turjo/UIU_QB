
DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit int DEFAULT 10)
RETURNS TABLE(id uuid, full_name text, avatar_url text, points int, department text, semester text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, avatar_url, points, department, semester
  FROM public.profiles
  ORDER BY points DESC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO anon, authenticated;
