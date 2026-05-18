import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Loader2, ShieldCheck, LogOut, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My profile — UIU Question Bank" }] }),
  component: ProfilePage,
});

const departments = ["CSE", "EEE", "BBA", "MATH", "PHR", "CHEM", "ENG", "LAW"];
const semesters = ["Trimester 1", "Trimester 2", "Trimester 3", "Trimester 4", "Trimester 5", "Trimester 6", "Trimester 7", "Trimester 8", "Trimester 9", "Trimester 10", "Trimester 11", "Trimester 12"];

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading, signOut, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }
    setUploadingAvatar(true);
    try {
      const ext = f.name.split(".").pop() || "png";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, f, { cacheControl: "3600", upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (dbErr) throw dbErr;
      setAvatarUrl(url);
      await refreshProfile();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setStudentId(profile.student_id ?? "");
      setDepartment(profile.department ?? "");
      setSemester(profile.semester ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const initials = (fullName || user.email || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        student_id: studentId,
        department,
        semester,
        avatar_url: avatarUrl || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved");
      refreshProfile();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-7 sm:p-10">
            <div className="flex items-center gap-5 flex-wrap">
              <label className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-display font-bold text-background glow overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
                </div>
                <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar} onChange={handleAvatarFile} />
              </label>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold truncate">{fullName || "Anonymous student"}</h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md gradient-bg text-background font-semibold">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Click your avatar to upload a new photo</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 rounded-xl glass text-sm inline-flex items-center gap-2 hover:bg-destructive/20 hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-10 grid sm:grid-cols-2 gap-5">
              <Field label="Full name"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Tanvir Hossain" /></Field>
              <Field label="Student ID"><input value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input" placeholder="0112320001" /></Field>
              <Field label="Department">
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Trimester">
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-3 pt-2">
                {isAdmin ? (
                  <Link to="/admin" className="px-4 py-2 rounded-xl glass text-sm inline-flex items-center gap-2 hover:bg-white/10">
                    <GraduationCap className="w-4 h-4" /> Open admin panel
                  </Link>
                ) : <span />}
                <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl gradient-bg text-background font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>

          <MyUploads userId={user.id} />
        </motion.div>
      </div>

      <style>{`
        .input { width: 100%; padding: 0.7rem 1rem; border-radius: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); outline: none; font-size: 0.875rem; color: var(--color-foreground); }
        .input:focus { box-shadow: 0 0 0 2px var(--color-primary); }
      `}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
