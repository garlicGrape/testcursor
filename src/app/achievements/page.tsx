"use client";

import { ACHIEVEMENTS } from "@/data/types";
import { ProgressBackup } from "@/components/ProgressBackup";
import { useProgress } from "@/components/ProgressProvider";

export default function AchievementsPage() {
  const { progress } = useProgress();
  const unlocked = new Set(progress.achievements);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Badges</h1>
      <p className="mt-2 text-paper/65">
        {unlocked.size} / {ACHIEVEMENTS.length} unlocked. Streaks and clean takes (no hints) are worth more than grinding
        with the solution tab open.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              className={`rounded-2xl border p-5 ${
                on ? "border-gold-400/50 bg-gold-400/10" : "border-violet-500/15 bg-ink-900/40 opacity-60"
              }`}
            >
              <div className="font-mono text-[11px] uppercase text-gold-400">{on ? "unlocked" : "locked"}</div>
              <h2 className="mt-1 font-display text-2xl">{a.name}</h2>
              <p className="mt-2 text-sm text-paper/70">{a.description}</p>
              <p className="mt-3 font-mono text-xs text-paper/45">+{a.xp} XP</p>
            </li>
          );
        })}
      </ul>
      <ProgressBackup />
    </div>
  );
}
