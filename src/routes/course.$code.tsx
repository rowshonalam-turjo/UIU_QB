import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, Upload as UploadIcon, Loader2, Eye, Share2, Check, Archive, Plus } from "lucide-react";
import JSZip from "jszip";
import { CSE_COURSES, getUploadTypesFor, type UploadType } from "@/lib/cse-courses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { addSolutionToUpload } from "@/lib/uploads.functions";

export const Route = createFileRoute("/course/$code")({
  head: ({ params }) => ({ meta: [{ title: `${params.code.replace(/-/g, " ")} — UIU Question Bank` }] }),
  component: CoursePage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <Link to="/courses" className="text-sm gradient-text">Browse all courses</Link>
      </div>
    </div>
  ),
});

type Upload = {
  id: string;
  title: string;
  course_code: string;
  type: string;
  trimester: string | null;
  teacher: string | null;
  description: string | null;
  file_url: string;
  file_name: string;
  solution_url: string | null;
  solution_name: string | null;
  code_url: string | null;
  code_name: string | null;
  cover_url: string | null;
  created_at: string;
};

function CoursePage() {
  const { code } = Route.useParams();
  const courseCode = code.replace(/-/g, " ");
  const course = CSE_COURSES.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
  if (!course) throw notFound();

  const availableTypes = getUploadTypesFor(course.code);
  const [tab, setTab] = useState<UploadType>(availableTypes[0]);

  const [items, setItems] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState<"q" | "s" | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("uploads")
      .select("id,title,course_code,type,trimester,teacher,description,file_url,file_name,solution_url,solution_name,code_url,code_name,cover_url,created_at")
      .ilike("course_code", course.code)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setItems((data as Upload[]) ?? []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [course.code]);

  const filtered = useMemo(() => items.filter((i) => i.type === tab), [items, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, Upload[]>();
    for (const u of filtered) {
      const key = u.trimester?.trim() || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const downloadZip = async (kind: "q" | "s") => {
    const list = kind === "q"
      ? filtered
      : filtered.filter((u) => u.solution_url);
    if (list.length === 0) {
      toast.error(kind === "q" ? "No questions to download" : "No solutions available");
      return;
    }
    setZipping(kind);
    try {
      const zip = new JSZip();
      const seen = new Map<string, number>();
      await Promise.all(list.map(async (u) => {
        const url = kind === "q" ? u.file_url : u.solution_url!;
        const baseName = (kind === "q" ? u.file_name : (u.solution_name ?? u.file_name)) || `${u.title}.pdf`;
        const safeTri = (u.trimester || "Other").replace(/[^\w\s-]/g, "").trim();
        let name = `${safeTri}/${baseName}`;
        const n = seen.get(name) ?? 0;
        seen.set(name, n + 1);
        if (n > 0) {
          const dot = baseName.lastIndexOf(".");
          const stem = dot > 0 ? baseName.slice(0, dot) : baseName;
          const ext = dot > 0 ? baseName.slice(dot) : "";
          name = `${safeTri}/${stem}-${n}${ext}`;
        }
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          zip.file(name, blob);
        } catch {
          // skip failed
        }
      }));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      const dl = URL.createObjectURL(blob);
      a.href = dl;
      a.download = `${course.code.replace(/\s+/g, "_")}_${tab}_${kind === "q" ? "questions" : "solutions"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dl);
      toast.success(`Downloaded ${list.length} ${kind === "q" ? "questions" : "solutions"}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to build zip");
    } finally {
      setZipping(null);
    }
  };

  const solutionsCount = filtered.filter((u) => u.solution_url).length;

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> All courses
        </Link>

        <div className="glass-card p-7 sm:p-10 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-mono text-sm text-muted-foreground mb-2">{course.code}</div>
              <h1 className="text-2xl sm:text-4xl font-bold">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-2">Browse past papers by trimester. Hover any file to preview, click to download.</p>
            </div>
            <Link to="/upload" className="px-4 py-2.5 rounded-xl gradient-bg text-background text-sm font-medium inline-flex items-center gap-2">
              <UploadIcon className="w-4 h-4" /> Contribute
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {availableTypes.map((t) => {
              const count = items.filter((i) => i.type === t).length;
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-colors ${
                    active ? "gradient-bg text-background glow" : "glass hover:bg-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? "bg-background/30" : "bg-white/10"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {filtered.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Bulk download:</span>
              <button
                onClick={() => downloadZip("q")}
                disabled={zipping !== null}
                className="px-3 py-2 rounded-xl gradient-bg text-background text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                {zipping === "q" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                All {tab} questions ({filtered.length})
              </button>
              <button
                onClick={() => downloadZip("s")}
                disabled={zipping !== null || solutionsCount === 0}
                className="px-3 py-2 rounded-xl glass text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/10 disabled:opacity-50"
              >
                {zipping === "s" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                All {tab} solutions ({solutionsCount})
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No {tab} papers uploaded yet for this course.</p>
            <Link to="/upload" className="mt-4 inline-flex items-center gap-2 text-sm gradient-text font-medium">
              Be the first to upload <UploadIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([trimester, list]) => (
              <section key={trimester}>
                <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">{trimester}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <FileCard
                        upload={u}
                        onSolutionAdded={(sol) =>
                          setItems((prev) =>
                            prev.map((p) => (p.id === u.id ? { ...p, ...sol } : p)),
                          )
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileCard({ upload, onSolutionAdded }: { upload: Upload; onSolutionAdded?: (sol: { solution_url: string; solution_name: string }) => void }) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(upload.file_url);
  const { user } = useAuth();
  const navigate = useNavigate();
  const addSolution = useServerFn(addSolutionToUpload);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingSol, setUploadingSol] = useState(false);

  const trackDownload = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("download_events").insert({
      upload_id: upload.id,
      user_id: user?.id ?? null,
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/course/${upload.course_code.replace(/\s+/g, "-")}?q=${upload.id}`;
    const shareData = { title: upload.title, text: `${upload.title} — UIU Question Bank`, url: shareUrl };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch { /* fall through */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handlePickSolution = () => {
    if (!user) {
      toast.info("Please sign in to add a solution");
      navigate({ to: "/auth" });
      return;
    }
    fileRef.current?.click();
  };

  const handleSolutionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !user) return;
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!["pdf", "jpg", "jpeg", "png", "webp"].includes(ext)) {
      toast.error("Only PDF, JPG, PNG or WEBP allowed");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Solution file too large (max 20MB)");
      return;
    }
    setUploadingSol(true);
    try {
      const path = `${user.id}/solutions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("questions").upload(path, f, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("questions").getPublicUrl(path);
      await addSolution({
        data: {
          upload_id: upload.id,
          solution_url: pub.publicUrl,
          solution_path: path,
          solution_name: f.name,
        },
      });
      toast.success("Solution added! Thanks for contributing.");
      onSolutionAdded?.({ solution_url: pub.publicUrl, solution_name: f.name });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add solution");
    } finally {
      setUploadingSol(false);
    }
  };

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group glass-card overflow-hidden relative hover:shadow-2xl hover:shadow-primary/10"
    >
      <div className="relative h-52 bg-gradient-to-br from-black/40 via-black/20 to-primary/10 border-b border-border overflow-hidden">
        {upload.cover_url ? (
          <motion.img
            src={upload.cover_url}
            alt={upload.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={false}
            animate={{ scale: hover ? 1.08 : 1, filter: hover ? "brightness(1.05)" : "brightness(0.95)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            loading="lazy"
          />
        ) : isPdf ? (
          <>
            <iframe
              src={`${upload.file_url}#toolbar=0&navpanes=0&view=FitH`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              title={upload.title}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
              animate={{ opacity: hover ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <FileText className="w-10 h-10 text-muted-foreground" />
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {/* sheen */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: hover ? "120%" : "-120%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />

        {/* bottom gradient + meta */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/80 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur">
              {upload.type}
            </span>
            <a
              href={upload.file_url}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 rounded-md glass text-[10px] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="w-3 h-3" /> Open
            </a>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold leading-tight">{upload.title}</h3>
        {upload.teacher && <p className="text-xs text-muted-foreground mt-1">{upload.teacher}</p>}

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <a
            href={upload.file_url}
            download={upload.file_name}
            target="_blank"
            rel="noreferrer"
            onClick={trackDownload}
            className="px-3 py-1.5 rounded-lg gradient-bg text-background text-xs font-medium inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Question
          </a>
          {upload.solution_url ? (
            <a
              href={upload.solution_url}
              download={upload.solution_name ?? undefined}
              target="_blank"
              rel="noreferrer"
              onClick={trackDownload}
              className="px-3 py-1.5 rounded-lg glass text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/10"
            >
              <Download className="w-3.5 h-3.5" /> Solution
            </a>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePickSolution}
                disabled={uploadingSol}
                className="px-3 py-1.5 rounded-lg glass text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/10 disabled:opacity-60"
                title="Upload a solution PDF for this question"
              >
                {uploadingSol ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {uploadingSol ? "Uploading…" : "Add solution"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleSolutionFile}
              />
            </>
          )}
          {upload.code_url && (
            <a
              href={upload.code_url}
              download={upload.code_name ?? undefined}
              target="_blank"
              rel="noreferrer"
              onClick={trackDownload}
              className="px-3 py-1.5 rounded-lg glass text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/10"
              title="Project source code"
            >
              <Archive className="w-3.5 h-3.5" /> Code
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="ml-auto px-3 py-1.5 rounded-lg glass text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/10"
            title="Share link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
