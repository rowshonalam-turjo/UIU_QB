import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, Upload as UploadIcon, Loader2, Eye, Share2, Check } from "lucide-react";
import { CSE_COURSES, UPLOAD_TYPES, type UploadType } from "@/lib/cse-courses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  created_at: string;
};

function CoursePage() {
  const { code } = Route.useParams();
  const courseCode = code.replace(/-/g, " ");
  const course = CSE_COURSES.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
  if (!course) throw notFound();

  const [tab, setTab] = useState<UploadType>("CT");
  const [items, setItems] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("uploads")
      .select("id,title,course_code,type,trimester,teacher,description,file_url,file_name,solution_url,solution_name,created_at")
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

  const grouped = useMemo(() => {
    const filtered = items.filter((i) => i.type === tab);
    const map = new Map<string, Upload[]>();
    for (const u of filtered) {
      const key = u.trimester?.trim() || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    }
    return Array.from(map.entries());
  }, [items, tab]);

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
            {UPLOAD_TYPES.map((t) => {
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
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <FileCard upload={u} />
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

function FileCard({ upload }: { upload: Upload }) {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(upload.file_url);

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
    } catch { /* user cancelled — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group glass-card overflow-hidden relative"
    >
      <div className="relative h-44 bg-black/30 border-b border-border overflow-hidden">
        {isPdf ? (
          <>
            <iframe
              src={`${upload.file_url}#toolbar=0&navpanes=0&view=FitH`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              title={upload.title}
            />
            <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity ${hover ? "opacity-0" : "opacity-100"}`}>
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <a
          href={upload.file_url}
          target="_blank"
          rel="noreferrer"
          className="absolute top-2 right-2 px-2 py-1 rounded-md glass text-[10px] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-3 h-3" /> Open
        </a>
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
            <span className="text-[10px] text-muted-foreground px-2 py-1">No solution yet</span>
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
    </div>
  );
}
