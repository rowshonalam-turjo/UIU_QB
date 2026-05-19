
-- Points on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;

-- Cover photo on uploads
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS cover_path text;

-- Restrict user delete: only own AND status='pending'
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploads;
CREATE POLICY "Users can delete own pending uploads"
ON public.uploads FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Points trigger: award on approval, revoke on un-approval
CREATE OR REPLACE FUNCTION public.handle_upload_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'approved' AND COALESCE(OLD.status, '') <> 'approved' THEN
      UPDATE public.profiles SET points = points + 10 WHERE id = NEW.user_id;
    ELSIF OLD.status = 'approved' AND NEW.status <> 'approved' THEN
      UPDATE public.profiles SET points = GREATEST(points - 10, 0) WHERE id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'approved' THEN
      UPDATE public.profiles SET points = GREATEST(points - 10, 0) WHERE id = OLD.user_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS uploads_points_update ON public.uploads;
CREATE TRIGGER uploads_points_update
AFTER UPDATE ON public.uploads
FOR EACH ROW EXECUTE FUNCTION public.handle_upload_points();

DROP TRIGGER IF EXISTS uploads_points_delete ON public.uploads;
CREATE TRIGGER uploads_points_delete
AFTER DELETE ON public.uploads
FOR EACH ROW EXECUTE FUNCTION public.handle_upload_points();
