import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, BookOpen, ArrowRight } from "lucide-react";
import { CSE_COURSES } from "@/lib/cse-courses";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "CSE Courses — UIU Question Bank" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CSE_COURSES;
    return CSE_COURSES.filter(
      (c) => c.code.toLowerCase().includes(s) || c.title.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.82_0.18_200)] mb-3">
            <BookOpen className="w-4 h-4" /> CSE Department
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold">Find your <span className="gradient-text">course</span></h1>
          <p className="text-muted-foreground mt-3">Search by course code (e.g. CSE 2215) or title.</p>
        </div>

        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 gradient-bg rounded-2xl opacity-40 blur-md group-focus-within:opacity-100 transition" />
          <div className="relative glass-card flex items-center gap-3 px-5 py-4">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CSE 2215, Data Structures, Database…"
              className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered[0]) {
                  navigate({ to: "/course/$code", params: { code: filtered[0].code.replace(/\s+/g, "-") } });
                }
              }}
            />
            <span className="text-xs text-muted-foreground">{filtered.length}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            >
              <Link
                to="/course/$code"
                params={{ code: c.code.replace(/\s+/g, "-") }}
                className="group block glass-card p-5 hover:bg-white/5 transition-colors h-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs px-2 py-1 rounded-md glass">{c.code}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-semibold leading-snug">{c.title}</div>
              </Link>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 glass-card p-10 text-center text-muted-foreground text-sm">
              No course matches "{q}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
