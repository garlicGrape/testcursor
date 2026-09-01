"use client";

import { recentActiveDays, streakStatus } from "@/lib/game";
import type { Progress } from "@/data/types";

export function StreakCalendar({ progress }: { progress: Progress }) {
  const days = recentActiveDays(progress, 28);
  const status = streakStatus(progress);

  const copy =
    status.kind === "done-today"
      ? "Logged today in this browser."
      : status.kind === "at-risk"
        ? `Submit a passing solution today to keep ${progress.streak} day${progress.streak === 1 ? "" : "s"}.`
        : status.kind === "broken"
          ? "Missed a day — the next passing Submit starts at 1."
          : "Streaks count a passing Submit or a newly studied pattern, once per local calendar day.";

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">This browser</div>
          <h2 className="mt-1 font-display text-2xl">
            {progress.streak} day streak
            {status.kind === "at-risk" ? " · at risk" : ""}
          </h2>
        </div>
        <p className="max-w-sm text-right text-xs text-paper/55">{copy}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {days.map((day) => (
          <span
            key={day.stamp}
            title={day.stamp}
            className={`h-3.5 w-3.5 rounded-sm ${day.on ? "bg-gold-400" : "bg-ink-800"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-paper/45">
        Gold = a day you earned in this browser. Clearing site data, private mode, or another device is a different
        streak. Export JSON from Badges before you switch machines.
      </p>
    </section>
  );
}
