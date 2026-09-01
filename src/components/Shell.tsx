"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XP_PER_LEVEL } from "@/data/types";
import { levelFromXp, rankForLevel, xpIntoLevel } from "@/lib/game";
import { useProgress } from "./ProgressProvider";

const NAV = [
  { href: "/", label: "Board" },
  { href: "/practice", label: "Practice" },
  { href: "/review", label: "Review" },
  { href: "/quests", label: "Quests" },
  { href: "/learn", label: "Patterns" },
  { href: "/resources", label: "Study" },
  { href: "/achievements", label: "Badges" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { progress, ready } = useProgress();
  const level = levelFromXp(progress.xp);
  const rank = rankForLevel(level);
  const into = xpIntoLevel(progress.xp);
  const pct = Math.min(100, Math.round((into / XP_PER_LEVEL) * 100));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-violet-500/20 bg-ink-900/80 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <Link href="/" className="block">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">Job interviews</div>
            <div className="font-display text-3xl font-semibold tracking-tight text-paper">Dojo</div>
          </Link>
          <div className="hidden font-mono text-[11px] text-paper/50 lg:mt-6 lg:block">
            Coding rounds · DS/MLE/SWE
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-8">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 font-mono text-sm ${
                  active ? "bg-violet-600/30 text-gold-200" : "text-paper/65 hover:bg-ink-800 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-4 border-b border-violet-500/20 bg-ink-900/50 px-5 py-3">
          <div className="min-w-[220px] flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-paper/55">
              <span>
                Lv {ready ? level : "—"} · {ready ? rank.title : "…"}
              </span>
              <span>
                {ready ? into : 0} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
              <div className="hud-bar h-full transition-[width]" style={{ width: `${ready ? pct : 0}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="rounded-full border border-ember/40 bg-ember/10 px-3 py-1 text-ember">
              {ready ? progress.streak : 0} day streak
            </span>
            <span className="text-gold-400">{ready ? progress.xp : 0} XP</span>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
