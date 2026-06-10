import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Flame, Trophy, Upload } from "lucide-react";

const tabs = [
  { to: "/courses", label: "Courses", icon: BookOpen, match: (p: string) => p.startsWith("/courses") || p.startsWith("/course") },
  { to: "/#trending", label: "Trending", icon: Flame, match: (p: string, h: string) => p === "/" && h === "#trending", hash: true },
  { to: "/#leaderboard", label: "Leaderboard", icon: Trophy, match: (p: string, h: string) => p === "/" && h === "#leaderboard", hash: true },
  { to: "/upload", label: "Upload", icon: Upload, match: (p: string) => p.startsWith("/upload") },
];

export function MobileBottomNav() {
  const { pathname, hash } = useRouterState({ select: (s) => s.location });

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2"
    >
      <div className="glass rounded-2xl px-2 py-2 grid grid-cols-4 gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.match(pathname, hash ? `#${hash}` : "");
          const cls = `flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
            active ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground"
          }`;
          if (t.hash) {
            return (
              <a key={t.to} href={t.to} className={cls}>
                <Icon className="w-5 h-5" />
                <span>{t.label}</span>
              </a>
            );
          }
          return (
            <Link key={t.to} to={t.to} className={cls}>
              <Icon className="w-5 h-5" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
