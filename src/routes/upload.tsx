import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload as UploadIcon, Loader2, FileText, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CSE_COURSES, UPLOAD_TYPES } from "@/lib/cse-courses";
import { pdfFirstPageCover } from "@/lib/pdf-cover";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload — UIU Question Bank" }] }),
  component: UploadPage,
});

const TRIMESTERS = (() => {
  const out: string[] = [];
  const seasons = ["Spring", "Summer", "Fall"];
  for (let y = 2026; y >= 2019; y--) for (const s of seasons) out.push(`${s} ${y}`);
  return out;
})();

function UploadPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [type, setType] = useState("");
  const [trimester, setTrimester] = useState("");
  const [teacher, setTeacher] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [solution, setSolution] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const uploadFile = async (f: File) => {
    const ext = f.name.split(".").pop() || "bin";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("questions").upload(path, f, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("questions").getPublicUrl(path);
    return { path, url: data.publicUrl };
  };

  const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];
  const validateFile = (f: File, label: string): boolean => {
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_MIME.includes(f.type) || !ALLOWED_EXT.includes(ext)) {
      toast.error(`${label}: only PDF, JPG, PNG or WEBP files are allowed`);
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error(`${label} too large (max 20MB)`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please choose a question file"); return; }
    if (!validateFile(file, "Question file")) return;
    if (solution && !validateFile(solution, "Solution file")) return;

    setBusy(true);
    try {
      const q = await uploadFile(file);
      let sol: { path: string; url: string } | null = null;
      if (solution) sol = await uploadFile(solution);

      // Try to auto-generate a cover image from PDF page 1 (best-effort, never blocks upload).
      let cover: { path: string; url: string } | null = null;
      try {
        const blob = await pdfFirstPageCover(file);
        if (blob) {
          const coverFile = new File([blob], `cover-${Date.now()}.jpg`, { type: "image/jpeg" });
          cover = await uploadFile(coverFile);
        }
      } catch { /* ignore cover generation errors */ }


      const { error: insErr } = await supabase.from("uploads").insert({
        user_id: user.id,
        title,
        course_code: courseCode,
        department: "CSE",
        type,
        trimester: trimester || null,
        teacher: teacher || null,
        description: description || null,
        file_url: q.url,
        file_path: q.path,
        file_name: file.name,
        file_size: file.size,
        solution_url: sol?.url ?? null,
        solution_path: sol?.path ?? null,
        solution_name: solution?.name ?? null,
        cover_url: cover?.url ?? null,
        cover_path: cover?.path ?? null,
        status: "pending",
      });
      if (insErr) throw insErr;

      toast.success("Uploaded! It will appear after admin approval.");
      navigate({ to: "/courses" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-7 sm:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow">
                <UploadIcon className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Share a CSE paper</h1>
                <p className="text-sm text-muted-foreground">PDF preferred · max 20MB · reviewed by admins.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
              <Field label="Title" full>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Data Structures — Final 2024" />
              </Field>
              <Field label="Course">
                <select required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="input">
                  <option value="">Select course…</option>
                  {CSE_COURSES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.title}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select required value={type} onChange={(e) => setType(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {UPLOAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Trimester">
                <select value={trimester} onChange={(e) => setTrimester(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {TRIMESTERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Teacher (optional)">
                <input value={teacher} onChange={(e) => setTeacher(e.target.value)} className="input" placeholder="Dr. Mahmud" />
              </Field>
              <Field label="Description (optional)" full>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows={3} placeholder="Any notes about this paper…" />
              </Field>

              <Field label="Question file (PDF preferred)" full>
                <FilePicker file={file} onChange={setFile} />
              </Field>

              <Field label="Solution file (optional)" full>
                <FilePicker file={solution} onChange={setSolution} hint="Upload the solution PDF if you have one — students will be able to download it alongside the question." />
              </Field>

              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl gradient-bg text-background font-medium text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  <UploadIcon className="w-4 h-4" /> Submit upload
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <style>{`
        .input { width: 100%; padding: 0.7rem 1rem; border-radius: 0.75rem; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); outline: none; font-size: 0.875rem; color: var(--color-foreground); font-family: inherit; }
        .input:focus { box-shadow: 0 0 0 2px var(--color-primary); }
      `}</style>
    </div>
  );
}

function FilePicker({ file, onChange, hint }: { file: File | null; onChange: (f: File | null) => void; hint?: string }) {
  return file ? (
    <div className="flex items-center gap-3 p-4 rounded-xl glass">
      <FileText className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
      </div>
      <button type="button" onClick={() => onChange(null)} className="p-2 rounded-lg hover:bg-white/10">
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <label className="flex flex-col items-center justify-center p-6 rounded-xl glass border-2 border-dashed border-border cursor-pointer hover:bg-white/5 transition-colors">
      <UploadIcon className="w-5 h-5 text-muted-foreground mb-2" />
      <span className="text-sm">Click to choose a file</span>
      <span className="text-xs text-muted-foreground mt-1 text-center">{hint ?? "PDF, DOCX, image — up to 20MB"}</span>
      <input type="file" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
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
