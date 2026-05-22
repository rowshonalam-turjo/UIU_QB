
-- 1. Tighten storage SELECT policies (prevent listing all files; scope to owner's folder)
DROP POLICY IF EXISTS "Avatar files publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Question files publicly readable" ON storage.objects;

CREATE POLICY "Users can list own avatar files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can list own question files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'questions'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Admins keep full access via the existing "Admins manage all storage" ALL policy.
-- Public URL access (CDN) still works for both buckets because they are marked public.

-- 2. Lock down SECURITY DEFINER trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_upload_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role must remain executable so RLS policies and app code can call it.

-- 3. Admin audit log
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  upload_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('approved','rejected','deleted')),
  previous_status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_upload ON public.audit_logs(upload_id);
CREATE INDEX idx_audit_logs_admin ON public.audit_logs(admin_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(),'admin') AND admin_id = auth.uid());

-- Auto-log status changes on uploads
CREATE OR REPLACE FUNCTION public.log_upload_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status <> OLD.status AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.audit_logs(admin_id, upload_id, action, previous_status)
    VALUES (COALESCE(auth.uid(), NEW.user_id), NEW.id, NEW.status, OLD.status);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs(admin_id, upload_id, action, previous_status)
    VALUES (COALESCE(auth.uid(), OLD.user_id), OLD.id, 'deleted', OLD.status);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_upload_status_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_log_upload_status
AFTER UPDATE OR DELETE ON public.uploads
FOR EACH ROW EXECUTE FUNCTION public.log_upload_status_change();

-- 4. Per-upload, per-user download tracking
CREATE TABLE public.download_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_download_events_upload ON public.download_events(upload_id);
CREATE INDEX idx_download_events_user ON public.download_events(user_id);
CREATE INDEX idx_download_events_created ON public.download_events(created_at DESC);

ALTER TABLE public.download_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a download"
ON public.download_events FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can view all downloads"
ON public.download_events FOR SELECT
USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users can view their own downloads"
ON public.download_events FOR SELECT
USING (auth.uid() = user_id);

-- Increment uploads.downloads counter
CREATE OR REPLACE FUNCTION public.increment_download_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.uploads SET downloads = downloads + 1 WHERE id = NEW.upload_id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_download_count() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_increment_download_count
AFTER INSERT ON public.download_events
FOR EACH ROW EXECUTE FUNCTION public.increment_download_count();
