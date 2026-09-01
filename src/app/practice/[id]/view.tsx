"use client";

import Link from "next/link";
import { useState } from "react";
import { PROBLEM_BY_ID } from "@/data/problems";
import { useProgress } from "@/components/ProgressProvider";

export function ProblemView({ id }: { id: string }) {
  const problem = PROBLEM_BY_ID[id];
  const { progress, solve } = useProgress();
  const [hintsOpen, setHintsOpen] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  if (!problem) {
    return <p className="text-paper/70">Unknown problem.</p>;
  }

  const record = progress.solved[problem.id];

  async function mark(localPass: boolean) {
    const data = await solve(problem.id, { hintsUsed: hintsOpen, peekedSolution: peeked, localPass });
    if (data.firstSolve) {
      setFlash(
        `First solve +${data.xpEarned} XP${Array.isArray(data.newly) && data.newly.length ? ` · badges: ${data.newly.join(", ")}` : ""}`,
      );
    } else {
      setFlash("Already solved — logged another attempt.");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.35fr_0.9fr]">
      <article className="rounded-2xl bg-paper p-6 text-ink-950 shadow-dojo md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-700">
          {problem.leetcode ? `LC ${problem.leetcode.number} · ` : ""}
          {problem.difficulty} · {problem.pattern}
          {problem.fromUserList ? " · your list" : ""}
        </p>
        <h1 className="mt-2 font-display text-4xl">{problem.title}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{problem.prompt}</p>
        <h2 className="mt-6 font-display text-xl">Examples</h2>
        <ul className="mt-2 space-y-3">
          {problem.examples.map((ex) => (
            <li key={ex.input} className="rounded-lg bg-ink-950/5 p-3 font-mono text-sm">
              <div>in: {ex.input}</div>
              <div>out: {ex.output}</div>
              {ex.explanation && <div className="mt-1 text-ink-950/60">{ex.explanation}</div>}
            </li>
          ))}
        </ul>
        <h2 className="mt-6 font-display text-xl">Constraints</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-ink-950/80">
          {problem.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </article>
      <aside className="space-y-4">
        <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
          <h2 className="font-display text-2xl">Interview note</h2>
          <p className="mt-2 text-sm text-paper/70">{problem.interviewNote}</p>
          {problem.leetcode ? (
            <a
              href={`https://leetcode.com/problems/${problem.leetcode.slug}/`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono text-xs text-gold-400"
            >
              Closest LeetCode drill ↗
            </a>
          ) : (
            <p className="mt-3 font-mono text-xs text-paper/50">No 1:1 LeetCode twin — practice it here.</p>
          )}
          {problem.local && (
            <p className="mt-3 font-mono text-xs text-paper/55">
              Local: problems/{problem.id}/solution.py
              <br />
              python -m dojo solve {problem.id}
            </p>
          )}
        </section>
        <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
          <h2 className="font-display text-2xl">Hints</h2>
          <p className="mt-1 text-xs text-paper/50">Each hint cuts first-solve XP. The coach should nudge, not dump.</p>
          <div className="mt-3 space-y-2">
            {problem.hints.slice(0, hintsOpen).map((h, i) => (
              <p key={h} className="rounded-md bg-ink-800 px-3 py-2 text-sm text-paper/80">
                <span className="font-mono text-[10px] text-gold-400">H{i + 1}</span> {h}
              </p>
            ))}
          </div>
          {hintsOpen < problem.hints.length && (
            <button
              type="button"
              onClick={() => setHintsOpen((n) => n + 1)}
              className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs"
            >
              Unlock hint {hintsOpen + 1}
            </button>
          )}
        </section>
        <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
          <h2 className="font-display text-2xl">Log a solve</h2>
          <label className="mt-3 flex items-center gap-2 text-sm text-paper/70">
            <input type="checkbox" checked={peeked} onChange={(e) => setPeeked(e.target.checked)} />
            I peeked at a full solution (25% XP)
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void mark(false)}
              className="rounded-md bg-gold-400 px-3 py-2 font-mono text-xs text-ink-950"
            >
              {record ? "I solved it again" : "I solved it"}
            </button>
            {problem.local && (
              <button
                type="button"
                onClick={() => void mark(true)}
                className="rounded-md bg-violet-600 px-3 py-2 font-mono text-xs"
              >
                Local tests passed
              </button>
            )}
          </div>
          {record && (
            <p className="mt-3 font-mono text-xs text-gold-400">
              Solved {record.solvedAt} · {record.xpEarned} XP · {record.hintsUsed} hints
            </p>
          )}
          {flash && <p className="mt-3 text-sm text-violet-300">{flash}</p>}
        </section>
        <Link href="/practice" className="inline-block font-mono text-xs text-paper/50">
          ← All problems
        </Link>
      </aside>
    </div>
  );
}
