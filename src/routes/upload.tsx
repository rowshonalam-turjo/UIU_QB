import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload as UploadIcon, Loader2, FileText, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload — UIU Question Bank" }] }),
  component: UploadPage,
});

const departments = ["CSE", "EEE", "BBA", "MATH", "PHR", "CHEM", "ENG", "LAW"];
const types = ["CT", "Mid", "Final", "Assignment", "Viva", "Lab", "Notes"];

function UploadPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("");
  const [trimester, setTrimester] = useState("");
  const [teacher, setTeacher] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please choose a file"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("File too large (max 20MB)"); return; }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage.from("questions").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("questions").getPublicUrl(path);

      const { error: insErr } = await supabase.from("uploads").insert({
        user_id: user.id,
        title,
        course_code: courseCode,
        department: department || null,
        type,
        trimester: trimester || null,
        teacher: teacher || null,
        description: description || null,
        file_url: pub.publicUrl,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        status: "pending",
      });
      if (insErr) throw insErr;

      toast.success("Uploaded! It will appear after admin approval.");
      navigate({ to: "/" });
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
                <h1 className="text-2xl font-bold">Share a question paper</h1>
                <p className="text-sm text-muted-foreground">PDF, image, doc — max 20MB. Reviewed by admins.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
              <Field label="Title" full>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Data Structures — Final 2024" />
              </Field>
              <Field label="Course code">
                <input required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="input" placeholder="CSE 2215" />
              </Field>
              <Field label="Type">
                <select required value={type} onChange={(e) => setType(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input">
                  <option value="">Select…</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Trimester">
                <input value={trimester} onChange={(e) => setTrimester(e.target.value)} className="input" placeholder="Spring 2024" />
              </Field>
              <Field label="Teacher (optional)" full>
                <input value={teacher} onChange={(e) => setTeacher(e.target.value)} className="input" placeholder="Dr. Mahmud" />
              </Field>
              <Field label="Description (optional)" full>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows={3} placeholder="Any notes about this paper…" />
              </Field>

              <Field label="File" full>
                {file ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl glass">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="p-2 rounded-lg hover:bg-white/10">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 rounded-xl glass border-2 border-dashed border-border cursor-pointer hover:bg-white/5 transition-colors">
                    <UploadIcon className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-sm">Click to choose a file</span>
                    <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, images, ZIP — up to 20MB</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                )}
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

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
