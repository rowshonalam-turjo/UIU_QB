// Badge tiers — psychology of progression for university students.
// Warm achievement colors trigger dopamine; tiers are reachable but aspirational.
export type Badge = {
  name: string;
  min: number;
  color: string; // tailwind text color class
  bg: string;    // tailwind bg/gradient class
  emoji: string;
};

export const BADGES: Badge[] = [
  { name: "Newcomer",  min: 0,    color: "text-slate-300",   bg: "from-slate-500 to-slate-700",          emoji: "🌱" },
  { name: "Bronze",    min: 10,   color: "text-amber-200",   bg: "from-amber-700 to-orange-800",         emoji: "🥉" },
  { name: "Silver",    min: 50,   color: "text-slate-100",   bg: "from-slate-300 to-slate-500",          emoji: "🥈" },
  { name: "Gold",      min: 150,  color: "text-yellow-100",  bg: "from-yellow-400 to-amber-600",         emoji: "🥇" },
  { name: "Platinum",  min: 350,  color: "text-cyan-100",    bg: "from-cyan-300 to-sky-500",             emoji: "💎" },
  { name: "Diamond",   min: 700,  color: "text-fuchsia-100", bg: "from-fuchsia-400 via-pink-500 to-violet-600", emoji: "💠" },
  { name: "Legend",    min: 1500, color: "text-white",       bg: "from-orange-500 via-rose-500 to-fuchsia-600", emoji: "👑" },
];

export function badgeFor(points: number): Badge {
  let chosen = BADGES[0];
  for (const b of BADGES) if (points >= b.min) chosen = b;
  return chosen;
}

export function nextBadge(points: number): Badge | null {
  return BADGES.find((b) => b.min > points) ?? null;
}
