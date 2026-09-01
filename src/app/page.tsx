"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PATTERNS } from "@/data/types";
import { ACHIEVEMENTS } from "@/data/types";
import { PROBLEMS, PROBLEM_BY_ID } from "@/data/problems";
import {
  dailyQuests,
  isQuestDone,
  patternMastery,
  rankForLevel,
  recommendedProblem,
  reviewSchedule,
  levelFromXp,
} from "@/lib/game";
import { readLastProblemId } from "@/lib/lastProblem";
import { useProgress } from "@/components/ProgressProvider";

export default function BoardPage() {
  const { progress, ready } = useProgress();
  const [lastId, setLastId] = useState<string | null>(null);
  const quests = dailyQuests(progress);
  const rec = recommendedProblem(progress);
  const mastery = patternMastery(progress);
  const rank = rankForLevel(levelFromXp(progress.xp));
  const solved = Object.keys(progress.solved).filter((id) => progress.solved[id]?.localPass).length;
  const recentBadges = progress.achievements.slice(-3);
  const dueCount = reviewSchedule(progress).due.length;
  const last = lastId ? PROBLEM_BY_ID[lastId] : undefined;

  useEffect(() => {
    setLastId(readLastProblemId());
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">Today&apos;s loop</p>
        <h1 className="mt-2 font-display text-4xl text-paper md:text-5xl">Show up. Pick a fight. Talk out loud.</h1>
        <p className="mt-4 max-w-2xl text-paper/70">
          This dojo is for job interviews — coding rounds for SWE, data science, and MLE. {PROBLEMS.length} hidden-test
          problems (Python + SQL), a mock interviewer on every prompt, XP and badges only to keep you coming back. The
          actual skill is: clarify, name the pattern, code, then quote complexity.
        </p>
        {ready && (
          <p className="mt-3 font-mono text-sm text-violet-300">
            Rank: {rank.title} · {solved} solved · {progress.achievements.length} badges
          </p>
        )}
        <p className="mt-3 text-sm text-paper/45">
          Progress is saved in this browser (no login). Same laptop + same browser = your streak stays.
        </p>
      </section>

      {(last || dueCount > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {last && (
            <Link
              href={`/practice/${last.id}`}
              className="rounded-2xl border border-gold-400/30 bg-gold-400/5 px-5 py-4 hover:border-gold-400/60"
            >
              <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">Continue</div>
              <p className="mt-1 font-display text-xl text-paper">{last.title}</p>
              <p className="mt-1 font-mono text-xs text-paper/50">
                {last.kind === "sql" ? "SQL" : "Python"} · {last.difficulty} · last opened in this browser
              </p>
            </Link>
          )}
          {dueCount > 0 && (
            <Link
              href="/review"
              className="rounded-2xl border border-violet-500/25 bg-ink-900/70 px-5 py-4 hover:border-gold-400/40"
            >
              <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">Spaced review</div>
              <p className="mt-1 font-display text-xl text-paper">
                {dueCount} problem{dueCount === 1 ? "" : "s"} due
              </p>
              <p className="mt-1 font-mono text-xs text-paper/50">Re-solve from memory, then Submit again.</p>
            </Link>
          )}
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {quests.map((q) => {
          const done = isQuestDone(progress, q.id);
          return (
            <article
              key={q.id}
              className={`rounded-2xl border p-5 shadow-dojo ${
                done ? "border-gold-400/40 bg-gold-400/5" : "border-violet-500/25 bg-ink-900/70"
              }`}
            >
              <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">{q.kind}</div>
              <h2 className="mt-2 font-display text-2xl leading-tight">{q.title}</h2>
              <p className="mt-2 text-sm text-paper/65">{q.detail}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href={q.href} className="rounded-md bg-violet-600 px-3 py-1.5 font-mono text-xs text-white">
                  {done ? "Review" : "Open"}
                </Link>
                <span className={`font-mono text-xs ${done ? "text-gold-400" : "text-paper/45"}`}>
                  {done ? `Earned +${q.xp} XP` : `+${q.xp} XP after you finish`}
                </span>
              </div>
              {!done && <p className="mt-2 text-xs text-paper/45">{q.how}</p>}
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-6">
          <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">Recommended next</div>
          <h2 className="mt-2 font-display text-3xl">{rec.title}</h2>
          <p className="mt-2 text-paper/70">{rec.summary}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-paper/50">
            {rec.difficulty} · {rec.pattern} · {rec.estimatedMinutes} min · {rec.xp} XP
          </p>
          <p className="mt-4 text-sm text-paper/60">{rec.interviewNote}</p>
          <Link
            href={`/practice/${rec.id}`}
            className="mt-5 inline-block rounded-md bg-gold-400 px-4 py-2 font-mono text-sm text-ink-950"
          >
            Start problem
          </Link>
        </article>
        <article className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-6">
          <div className="font-mono text-[11px] uppercase tracking-wider text-gold-400">How to use the coach</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-paper/75">
            <li>Open a problem, start the <span className="text-gold-200">mock interviewer</span>, then write Python or SQL and hit Run / Submit.</li>
            <li>
              Ask the Cursor coach: <em className="text-paper">&quot;Coach me on pair-sum. Do not give the solution.&quot;</em>
            </li>
            <li>Submit only counts when hidden tests pass — that is what awards XP.</li>
            <li>Optional local CLI still works: <code className="font-mono text-gold-200">python -m dojo solve pair-sum</code></li>
          </ol>
          {recentBadges.length > 0 && (
            <p className="mt-4 font-mono text-xs text-violet-300">
              Recent: {recentBadges.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name ?? id).join(" · ")}
            </p>
          )}
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">Pattern mastery</h2>
          <Link href="/learn" className="font-mono text-xs text-gold-400">
            Study guides →
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PATTERNS.map((p) => {
            const m = mastery[p.id];
            const pct = m.total ? Math.round((m.solved / m.total) * 100) : 0;
            return (
              <Link
                key={p.id}
                href={`/learn/${p.id}`}
                className="rounded-xl border border-violet-500/20 bg-ink-800/50 px-4 py-3 hover:border-gold-400/40"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-paper">{p.name}</span>
                  <span className="font-mono text-[11px] text-paper/50">
                    {m.solved}/{m.total}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-950">
                  <div className="h-full bg-violet-400" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
