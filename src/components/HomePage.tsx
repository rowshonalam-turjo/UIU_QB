import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Upload,
  BookOpen,
  Cpu,
  FileText,
  Download,
  Heart,
  MessageSquare,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  GraduationCap,
  Trophy,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, User as UserIcon, LogIn, LogOut } from "lucide-react";
import { CSE_COURSES } from "@/lib/cse-courses";
import { supabase } from "@/integrations/supabase/client";
import { badgeFor } from "@/lib/badges";

type TrendingRow = {
  id: string;
  course_code: string;
  title: string;
  type: string;
  trimester: string | null;
  teacher: string | null;
  downloads: number;
  likes: number;
  file_url: string;
  cover_url: string | null;
};

const typeColors: Record<string, string> = {
  Final: "from-fuchsia-500 to-violet-500",
  Mid: "from-cyan-500 to-blue-500",
  CT: "from-amber-500 to-orange-500",
  Assignment: "from-emerald-500 to-teal-500",
};

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4">
      <nav className="glass max-w-7xl mx-auto rounded-2xl px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow">
              <GraduationCap className="w-5 h-5 text-background" strokeWidth={2.5} />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base tracking-tight">UIU</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">Question Bank</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
          <a href="/#trending" className="hover:text-foreground transition-colors">Trending</a>
          <a href="/#leaderboard" className="hover:text-foreground transition-colors">Leaderboard</a>
          <Link to="/upload" className="hover:text-foreground transition-colors">Upload</Link>
        </div>

        <AuthArea />
      </nav>
    </header>
  );
}

function AuthArea() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  if (loading) return <div className="w-20 h-9" />;
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/auth" className="text-sm font-medium px-4 py-2 rounded-xl gradient-bg text-background inline-flex items-center gap-1.5">
          <LogIn className="w-4 h-4" /> Sign in
        </Link>
      </div>
    );
  }
  const initials = (profile?.full_name || user.email || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <Link to="/admin" className="hidden sm:inline-flex text-xs font-semibold px-3 py-2 rounded-xl gradient-bg text-background items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin
        </Link>
      )}
      <Link to="/profile" className="inline-flex items-center gap-2 px-2 py-1.5 rounded-xl glass hover:bg-white/10 transition-colors">
        <span className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-background text-xs font-bold overflow-hidden">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
        </span>
        <span className="hidden sm:inline text-xs font-medium pr-1.5 max-w-[120px] truncate">{profile?.full_name || user.email}</span>
        <UserIcon className="w-3.5 h-3.5 text-muted-foreground sm:hidden" />
      </Link>
      <button
        onClick={() => signOut()}
        title="Sign out"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-[oklch(0.55_0.25_295)] opacity-30 blur-[120px] animate-pulse" />
      <div className="absolute top-40 right-0 w-[28rem] h-[28rem] rounded-full bg-[oklch(0.65_0.2_200)] opacity-25 blur-[140px]" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-[oklch(0.65_0.25_350)] opacity-20 blur-[120px]" />
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return CSE_COURSES.filter((c) => c.code.toLowerCase().includes(s) || c.title.toLowerCase().includes(s)).slice(0, 6);
  }, [q]);

  const goToFirst = () => {
    if (suggestions[0]) navigate({ to: "/course/$code", params: { code: suggestions[0].code.replace(/\s+/g, "-") } });
    else navigate({ to: "/courses" });
  };

  return (
    <section className="relative pt-36 pb-24 px-4 sm:px-6">
      <div className="absolute inset-0 grid-bg -z-10" />
      <FloatingOrbs />

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[oklch(0.82_0.18_200)]" />
          <span>Built by UIU CSE students, for UIU CSE students</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span className="text-foreground">v1.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight"
        >
          Every <span className="gradient-text">CSE question</span>
          <br /> you'll ever need.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          CT, Mid, Final & Assignment papers for every UIU CSE course — organized by trimester, with solution PDFs and instant preview.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 max-w-2xl mx-auto relative"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 gradient-bg rounded-2xl opacity-60 blur-md group-hover:opacity-100 transition duration-500" />
            <div className="relative glass-card flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") goToFirst(); }}
                placeholder="Try 'CSE 2215' or 'Data Structures'…"
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground"
              />
              <button onClick={goToFirst} className="text-sm font-medium px-4 py-2 rounded-xl gradient-bg text-background">
                Search
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 glass-card overflow-hidden text-left z-20">
              {suggestions.map((c) => (
                <Link
                  key={c.code}
                  to="/course/$code"
                  params={{ code: c.code.replace(/\s+/g, "-") }}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5 border-b border-border last:border-0"
                >
                  <span className="text-sm"><span className="font-mono text-muted-foreground mr-2">{c.code}</span>{c.title}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {["CSE 2215", "CSE 3411", "CSE 3431", "CSE 3521", "CSE 4495"].map((t) => (
              <Link
                key={t}
                to="/course/$code"
                params={{ code: t.replace(/\s+/g, "-") }}
                className="glass rounded-full px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {[
            { v: `${CSE_COURSES.length}`, l: "CSE Courses" },
            { v: "CT/Mid/Final", l: "Paper types" },
            { v: "Solutions", l: "Included" },
            { v: "Free", l: "Forever" },
          ].map((s) => (
            <div key={s.l} className="glass-card p-5">
              <div className="text-2xl sm:text-3xl font-bold gradient-text font-display">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Courses() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? CSE_COURSES.filter((c) => c.code.toLowerCase().includes(s) || c.title.toLowerCase().includes(s)) : CSE_COURSES;
    return list.slice(0, 12);
  }, [q]);

  return (
    <section id="courses" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.82_0.18_200)] mb-3">
              <Cpu className="w-4 h-4" /> CSE Department
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold">Pick your <span className="gradient-text">course</span></h2>
          </div>
          <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            View all {CSE_COURSES.length} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card flex items-center gap-3 px-5 py-3 mb-6 max-w-2xl">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search course code or name…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                to="/course/$code"
                params={{ code: c.code.replace(/\s+/g, "-") }}
                className="group relative glass-card p-5 overflow-hidden block h-full"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{c.code}</div>
                  <div className="font-semibold text-sm mt-1 leading-snug">{c.title}</div>
                  <div className="mt-4 flex items-center justify-end">
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center text-muted-foreground text-sm mt-4">No course matches "{q}".</div>
        )}
      </div>
    </section>
  );
}

function Trending() {
  const [items, setItems] = useState<TrendingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("uploads")
        .select("id, course_code, title, type, trimester, teacher, downloads, likes, file_url, cover_url")
        .eq("status", "approved")
        .order("downloads", { ascending: false })
        .limit(6);
      setItems((data ?? []) as TrendingRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section id="trending" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.72_0.25_350)] mb-3">
              <Flame className="w-4 h-4" /> Trending
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold">What's <span className="gradient-text">hot</span> right now</h2>
          </div>
          <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            Browse courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted-foreground text-sm">
            No approved uploads yet. <Link to="/upload" className="gradient-text font-medium">Be the first to share →</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((q, i) => (
              <motion.a
                key={q.id}
                href={q.file_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group glass-card relative overflow-hidden block"
              >
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 overflow-hidden relative">
                  {q.cover_url ? (
                    <img src={q.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-md bg-gradient-to-r ${typeColors[q.type] ?? "from-violet-500 to-fuchsia-500"} text-background`}>
                    {q.type}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-mono">{q.course_code}</span>
                  </div>
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">{q.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">{q.teacher ?? "—"} · {q.trimester ?? "—"}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> {q.downloads}</span>
                      <span className="inline-flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {q.likes}</span>
                    </div>
                    <FileText className="w-4 h-4 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type LeaderRow = { id: string; full_name: string | null; avatar_url: string | null; points: number; department: string | null };

function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("get_leaderboard", { _limit: 10 });
      setRows((data ?? []) as LeaderRow[]);
      setLoading(false);
    })();
  }, []);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <section id="leaderboard" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-400 mb-3">
            <Trophy className="w-4 h-4" /> Leaderboard
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold">Top <span className="gradient-text">contributors</span></h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
            Earn <span className="text-amber-400 font-semibold">+10 pts</span> for every approved upload. Climb the ranks, unlock badges.
          </p>
        </div>

        {loading ? (
          <div className="glass-card p-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            No contributors yet. <Link to="/upload" className="gradient-text font-medium">Be the first →</Link>
          </div>
        ) : (
          <>
            {podium.length > 0 && (
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {podium.map((u, i) => {
                  const b = badgeFor(u.points);
                  const heights = ["sm:mt-0", "sm:mt-6", "sm:mt-10"];
                  const rank = i + 1;
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass-card p-6 text-center relative overflow-hidden ${heights[i]}`}
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${b.bg}`} />
                      <div className="text-3xl mb-2">{["🥇", "🥈", "🥉"][i]}</div>
                      <div className="w-16 h-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center text-background font-bold text-lg overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.full_name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="font-semibold truncate mt-3">{u.full_name || "Anonymous"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">#{rank} · {u.department ?? "CSE"}</div>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> {u.points} pts
                      </div>
                      <div className={`mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-gradient-to-r ${b.bg} ${b.color} font-semibold`}>
                        {b.emoji} {b.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <div className="glass-card divide-y divide-border">
                {rest.map((u, i) => {
                  const b = badgeFor(u.points);
                  return (
                    <div key={u.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/5">
                      <div className="w-7 text-center text-sm font-bold text-muted-foreground">{i + 4}</div>
                      <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-background font-bold text-xs overflow-hidden shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.full_name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{u.full_name || "Anonymous"}</div>
                        <div className="text-[11px] text-muted-foreground">{u.department ?? "CSE"}</div>
                      </div>
                      <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-gradient-to-r ${b.bg} ${b.color} font-semibold`}>
                        {b.emoji} {b.name}
                      </span>
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold w-16 justify-end">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> {u.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto relative">
        <div className="absolute -inset-4 gradient-bg opacity-30 blur-3xl rounded-[3rem]" />
        <div className="relative glass-card p-10 sm:p-16 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 gradient-bg opacity-20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex w-14 h-14 rounded-2xl gradient-bg items-center justify-center glow mb-6">
              <Upload className="w-6 h-6 text-background" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
              Got past papers? <br />
              <span className="gradient-text">Share them in 30 seconds.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl mx-auto">
              Drop your CTs, mids, finals or notes. Admins review fast — your name on the leaderboard, your karma in the cloud.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/upload" className="px-6 py-3 rounded-xl gradient-bg text-background font-medium inline-flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload now
              </Link>
              <Link to="/courses" className="px-6 py-3 rounded-xl glass font-medium inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Browse courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative pt-16 pb-10 px-4 sm:px-6 border-t border-border mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-background" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display font-bold">UIU Question Bank</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A student initiative</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Independent, community-driven archive of academic resources for United International University students. Not affiliated with the university administration.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Explore</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/courses" className="hover:text-foreground text-muted-foreground">Browse courses</Link></li>
              <li><a href="/#trending" className="hover:text-foreground text-muted-foreground">Trending</a></li>
              <li><a href="/#leaderboard" className="hover:text-foreground text-muted-foreground">Leaderboard</a></li>
              <li><Link to="/upload" className="hover:text-foreground text-muted-foreground">Upload paper</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Account</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/auth" className="hover:text-foreground text-muted-foreground">Sign in</Link></li>
              <li><Link to="/profile" className="hover:text-foreground text-muted-foreground">My profile</Link></li>
              <li><Link to="/forgot-password" className="hover:text-foreground text-muted-foreground">Forgot password</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2026 UIU Question Bank · Crafted by{" "}
            <a href="https://github.com/rowshonalam-turjo" target="_blank" rel="noreferrer" className="text-foreground hover:underline font-medium">
              Md. Rowshon Alam
            </a>
          </p>
          <div className="flex items-center gap-3">
            <a href="https://github.com/rowshonalam-turjo" target="_blank" rel="noreferrer" title="GitHub" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/rowshonalam.rowshonalam.7" target="_blank" rel="noreferrer" title="Facebook" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.9h-2.33V22c4.78-.8 8.44-4.94 8.44-9.94z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <Courses />
        <Trending />
        <Leaderboard />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
