import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Upload,
  TrendingUp,
  BookOpen,
  Cpu,
  Calculator,
  Briefcase,
  Beaker,
  Languages,
  Scale,
  HeartPulse,
  FileText,
  Download,
  Heart,
  MessageSquare,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  GraduationCap,
  Crown,
  Flame,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, User as UserIcon, LogIn } from "lucide-react";

const departments = [
  { name: "CSE", full: "Computer Science", icon: Cpu, count: 1240, hue: "from-violet-500/30 to-fuchsia-500/30" },
  { name: "EEE", full: "Electrical Eng.", icon: Zap, count: 842, hue: "from-cyan-500/30 to-blue-500/30" },
  { name: "BBA", full: "Business Admin.", icon: Briefcase, count: 967, hue: "from-pink-500/30 to-rose-500/30" },
  { name: "MATH", full: "Mathematics", icon: Calculator, count: 318, hue: "from-amber-500/30 to-orange-500/30" },
  { name: "PHR", full: "Pharmacy", icon: HeartPulse, count: 445, hue: "from-emerald-500/30 to-teal-500/30" },
  { name: "CHEM", full: "Chemistry", icon: Beaker, count: 226, hue: "from-lime-500/30 to-green-500/30" },
  { name: "ENG", full: "English", icon: Languages, count: 384, hue: "from-indigo-500/30 to-violet-500/30" },
  { name: "LAW", full: "Law", icon: Scale, count: 192, hue: "from-rose-500/30 to-red-500/30" },
];

const trending = [
  { code: "CSE 2215", title: "Data Structures — Final 2024", type: "Final", trimester: "Spring 2024", downloads: 2340, likes: 412, teacher: "Dr. Mahmud" },
  { code: "EEE 2103", title: "Circuit Analysis — Mid Term", type: "Mid", trimester: "Fall 2023", downloads: 1820, likes: 298, teacher: "Prof. Rahman" },
  { code: "CSE 3411", title: "DBMS — Solved CT Bundle", type: "CT", trimester: "Summer 2024", downloads: 1660, likes: 376, teacher: "Ms. Tasnim" },
  { code: "BBA 1101", title: "Principles of Mgmt — Assignment", type: "Assignment", trimester: "Spring 2024", downloads: 1402, likes: 211, teacher: "Mr. Karim" },
  { code: "MATH 2183", title: "Linear Algebra — Final + Solution", type: "Final", trimester: "Fall 2023", downloads: 1290, likes: 256, teacher: "Dr. Hasan" },
  { code: "CSE 4495", title: "Machine Learning — Viva Notes", type: "Viva", trimester: "Spring 2024", downloads: 1184, likes: 332, teacher: "Dr. Ahmed" },
];

const contributors = [
  { name: "Tanvir Hossain", id: "0112320001", uploads: 47, rep: 9820, badge: "Legend" },
  { name: "Sumaiya Akter", id: "0112310045", uploads: 39, rep: 7610, badge: "Elite" },
  { name: "Rafsan Jani", id: "0112320118", uploads: 34, rep: 6940, badge: "Elite" },
  { name: "Mehedi Hasan", id: "0112310087", uploads: 28, rep: 5820, badge: "Pro" },
  { name: "Nusrat Jahan", id: "0112330012", uploads: 25, rep: 5210, badge: "Pro" },
];

const typeColors: Record<string, string> = {
  Final: "from-fuchsia-500 to-violet-500",
  Mid: "from-cyan-500 to-blue-500",
  CT: "from-amber-500 to-orange-500",
  Assignment: "from-emerald-500 to-teal-500",
  Viva: "from-pink-500 to-rose-500",
  Lab: "from-lime-500 to-green-500",
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
          <a href="#browse" className="hover:text-foreground transition-colors">Browse</a>
          <a href="#trending" className="hover:text-foreground transition-colors">Trending</a>
          <a href="#contributors" className="hover:text-foreground transition-colors">Leaderboard</a>
          <a href="#departments" className="hover:text-foreground transition-colors">Departments</a>
        </div>

        <AuthArea />
      </nav>
    </header>
  );
}

function AuthArea() {
  const { user, profile, isAdmin, loading } = useAuth();
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
          <span>Built by UIU students, for UIU students</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span className="text-foreground">v1.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight"
        >
          Every <span className="gradient-text">question</span>
          <br /> you'll ever need.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          A community-curated archive of CT, Mid, Final, Assignment & Viva
          materials across every UIU department. Search, preview, download — instantly.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 gradient-bg rounded-2xl opacity-60 blur-md group-hover:opacity-100 transition duration-500" />
            <div className="relative glass-card flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Try 'CSE 2215 final' or 'circuit analysis'…"
                className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground glass rounded-md px-2 py-1">
                <Sparkles className="w-3 h-3" /> AI
              </kbd>
              <button className="text-sm font-medium px-4 py-2 rounded-xl gradient-bg text-background">
                Search
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {["CSE 2215", "EEE 2103", "Mid 2024", "Solved CTs", "Pharmacy"].map((t) => (
              <button key={t} className="glass rounded-full px-3 py-1 text-muted-foreground hover:text-foreground transition-colors">
                {t}
              </button>
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
            { v: "12,400+", l: "Questions" },
            { v: "8", l: "Departments" },
            { v: "3,200+", l: "Active Students" },
            { v: "98.4%", l: "Approval Rate" },
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

function Departments() {
  return (
    <section id="departments" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.82_0.18_200)] mb-3">
              <BookOpen className="w-4 h-4" /> Browse by department
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold">Pick your <span className="gradient-text">discipline</span></h2>
          </div>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            View all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {departments.map((d, i) => (
            <motion.a
              key={d.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative glass-card p-6 overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${d.hue} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center mb-4">
                  <d.icon className="w-5 h-5" />
                </div>
                <div className="font-display font-bold text-lg">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.full}</div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{d.count.toLocaleString()} files</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section id="trending" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.72_0.25_350)] mb-3">
              <Flame className="w-4 h-4" /> Trending this week
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold">What's <span className="gradient-text">hot</span> right now</h2>
          </div>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            See all uploads <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trending.map((q, i) => (
            <motion.div
              key={q.code + q.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group glass-card p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-md bg-gradient-to-r ${typeColors[q.type] ?? "from-violet-500 to-fuchsia-500"} text-background`}>
                  {q.type}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{q.code}</span>
              </div>

              <h3 className="text-lg font-semibold leading-tight">{q.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{q.teacher} · {q.trimester}</p>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> {q.downloads.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {q.likes}</span>
                  <span className="inline-flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {Math.floor(q.likes / 6)}</span>
                </div>
                <FileText className="w-4 h-4 group-hover:text-foreground transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contributors() {
  return (
    <section id="contributors" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[oklch(0.7_0.25_295)] mb-3">
            <Crown className="w-4 h-4" /> Leaderboard
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold">Top <span className="gradient-text">contributors</span></h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            The students keeping this archive alive. Earn reputation with every approved upload.
          </p>
        </div>

        <div className="glass-card overflow-hidden">
          {contributors.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-4 px-5 sm:px-7 py-5 border-b border-border last:border-0 hover:bg-white/5 transition-colors"
            >
              <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm ${i === 0 ? "gradient-bg text-background glow" : "glass text-muted-foreground"}`}>
                {i + 1}
              </div>
              <div className="shrink-0 w-11 h-11 rounded-full gradient-bg flex items-center justify-center text-background font-bold text-sm">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{c.id}</div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted-foreground">Uploads</div>
                <div className="font-display font-bold">{c.uploads}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Reputation</div>
                <div className="font-display font-bold gradient-text">{c.rep.toLocaleString()}</div>
              </div>
              <span className="hidden md:inline text-[10px] uppercase tracking-wider px-2.5 py-1 glass rounded-md">{c.badge}</span>
            </motion.div>
          ))}
        </div>
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
              <button className="px-6 py-3 rounded-xl gradient-bg text-background font-medium inline-flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload now
              </button>
              <button className="px-6 py-3 rounded-xl glass font-medium inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> See guidelines
              </button>
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
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Browse questions</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Departments</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Leaderboard</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Upload guide</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Community</div>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Discord</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Report issue</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground text-muted-foreground">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2026 UIU Question Bank. Built with ♥ by students.</p>
          <div className="flex items-center gap-3">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
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
        <Departments />
        <Trending />
        <Contributors />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
