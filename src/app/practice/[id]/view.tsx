"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PROBLEM_BY_ID } from "@/data/problems";
import { useProgress } from "@/components/ProgressProvider";
import { CodeLab } from "@/components/CodeLab";

export function ProblemView({ id }: { id: string }) {
  const problem = PROBLEM_BY_ID[id];
  const { progress, solve } = useProgress();
  const [hintsOpen, setHintsOpen] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const onPassed = useCallback(
    async (opts: { hintsUsed: number; peekedSolution: boolean }) => {
      const data = await solve(id, { ...opts, localPass: true });
      if (data.firstSolve) {
        setFlash(
          `First solve +${data.xpEarned} XP${Array.isArray(data.newly) && data.newly.length ? ` · badges: ${data.newly.join(", ")}` : ""}`,
        );
      } else {
        setFlash("Already solved — tests still passed.");
      }
    },
    [id, solve],
  );

  if (!problem) {
    return <p className="text-paper/70">Unknown problem.</p>;
  }

  const record = progress.solved[problem.id];

  async function markExternal() {
    const data = await solve(problem.id, { hintsUsed: hintsOpen, peekedSolution: peeked, localPass: false });
    if (data.firstSolve) {
      setFlash(
        `Logged without in-app tests +${data.xpEarned} XP${Array.isArray(data.newly) && data.newly.length ? ` · badges: ${data.newly.join(", ")}` : ""}`,
      );
    } else {
      setFlash("Already solved — logged another attempt.");
    }
  }

  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-8.5rem)] xl:flex-row">
      <div className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto xl:w-[42%] xl:min-w-[22rem]">
        <article className="rounded-2xl bg-paper p-5 text-ink-950 shadow-dojo md:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-700">
            {problem.leetcode ? `LC ${problem.leetcode.number} · ` : ""}
            {problem.difficulty} · {problem.pattern}
            {problem.fromUserList ? " · your list" : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{problem.title}</h1>
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
              Official LeetCode twin ↗
            </a>
          ) : (
            <p className="mt-3 font-mono text-xs text-paper/50">No 1:1 LeetCode twin — the editor is the practice.</p>
          )}
        </section>
        <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
          <h2 className="font-display text-2xl">Hints</h2>
          <p className="mt-1 text-xs text-paper/50">Each hint cuts first-solve XP. Unlock one at a time.</p>
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
          <h2 className="font-display text-lg">Solved it on LeetCode.com?</h2>
          <p className="mt-1 text-xs text-paper/50">
            Prefer Submit in the editor — XP from hidden tests is the real loop. This is only if you already passed
            the official problem.
          </p>
          <button
            type="button"
            onClick={() => void markExternal()}
            className="mt-3 rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs"
          >
            {record ? "Log another external solve" : "I solved it on LeetCode.com"}
          </button>
          {record && (
            <p className="mt-3 font-mono text-xs text-gold-400">
              Solved {record.solvedAt} · {record.xpEarned} XP · {record.hintsUsed} hints
              {record.localPass ? " · in-app tests" : ""}
            </p>
          )}
        </section>
        <Link href="/practice" className="inline-block font-mono text-xs text-paper/50">
          ← All problems
        </Link>
      </div>
      <CodeLab
        problemId={problem.id}
        hintsUsed={hintsOpen}
        peeked={peeked}
        onPeekChange={setPeeked}
        onPassed={onPassed}
        flash={flash}
        alreadySolved={Boolean(record)}
      />
    </div>
  );
}
