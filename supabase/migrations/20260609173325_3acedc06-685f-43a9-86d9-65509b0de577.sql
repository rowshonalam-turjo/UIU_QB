CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, full_name text, avatar_url text, points integer, department text, semester text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name, p.avatar_url, p.points, p.department, p.semester
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.uploads u
    WHERE u.user_id = p.id AND u.status = 'approved'
  )
  ORDER BY p.points DESC NULLS LAST
  LIMIT GREATEST(_limit, 1);
$function$;