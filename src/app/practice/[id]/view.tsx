"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PROBLEM_BY_ID } from "@/data/problems";
import { useProgress } from "@/components/ProgressProvider";
import { CodeLab } from "@/components/CodeLab";
import { SqlLab } from "@/components/SqlLab";
import { SqlDataset } from "@/components/SqlDataset";
import { Coach } from "@/components/Coach";
import { getSqlSpec } from "@/data/sqlSpecs";
import type { TestResult } from "@/lib/harness";

export function ProblemView({ id }: { id: string }) {
  const problem = PROBLEM_BY_ID[id];
  const { progress, solve } = useProgress();
  const [hintsOpen, setHintsOpen] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<TestResult[] | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const onPassed = useCallback(
    async (opts: { hintsUsed: number; peekedSolution: boolean }) => {
      const data = await solve(id, { ...opts, localPass: true });
      if (data.firstSolve) {
        const questBit =
          Array.isArray(data.claimedQuests) && data.claimedQuests.length
            ? ` · quest: ${data.claimedQuests.join(", ")}`
            : "";
        setFlash(
          `First solve +${data.xpEarned} XP${Array.isArray(data.newly) && data.newly.length ? ` · badges: ${data.newly.join(", ")}` : ""}${questBit}`,
        );
      } else if (Array.isArray(data.claimedQuests) && data.claimedQuests.length) {
        setFlash(`Tests passed · quest complete: ${data.claimedQuests.join(", ")}`);
      } else {
        setFlash("Already solved — tests still passed.");
      }
    },
    [id, solve],
  );

  const onResults = useCallback((results: TestResult[], error: string | null) => {
    setLastResults(results);
    setLastError(error);
  }, []);

  if (!problem) {
    return <p className="text-paper/70">Unknown problem.</p>;
  }

  const record = progress.solved[problem.id];
  const isSql = problem.kind === "sql";

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

  const lab = isSql ? (
    <SqlLab
      problemId={problem.id}
      hintsUsed={hintsOpen}
      peeked={peeked}
      onPeekChange={setPeeked}
      onPassed={onPassed}
      onResults={onResults}
      flash={flash}
      alreadySolved={Boolean(record)}
    />
  ) : (
    <CodeLab
      problemId={problem.id}
      hintsUsed={hintsOpen}
      peeked={peeked}
      onPeekChange={setPeeked}
      onPassed={onPassed}
      onResults={onResults}
      flash={flash}
      alreadySolved={Boolean(record)}
    />
  );

  return (
    <div className="flex flex-col gap-4 xl:h-[calc(100vh-8.5rem)] xl:flex-row">
      <div className="order-2 flex min-h-0 w-full flex-col gap-4 overflow-y-auto xl:order-1 xl:w-[42%] xl:min-w-[22rem]">
        <article className="rounded-2xl bg-paper p-5 text-ink-950 shadow-dojo md:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-700">
            {problem.leetcode ? `LC ${problem.leetcode.number} · ` : ""}
            {isSql ? "SQL · " : "Python · "}
            {problem.difficulty} · {problem.pattern}
            {problem.fromUserList ? " · your list" : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{problem.title}</h1>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed">{problem.prompt}</p>
          {isSql && getSqlSpec(problem.id) ? (
            <div className="mt-6">
              <h2 className="font-display text-xl">Tables &amp; sample rows</h2>
              <p className="mt-1 text-sm text-ink-950/65">
                This is the dataset your query runs on. Write a SELECT that returns the columns in{" "}
                <span className="font-medium">Return this</span>.
              </p>
              <div className="mt-3">
                <SqlDataset spec={getSqlSpec(problem.id)!} tone="light" defaultOpen />
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-6 font-display text-xl">Examples</h2>
              <ul className="mt-2 space-y-3">
                {problem.examples.map((ex) => (
                  <li key={ex.input} className="overflow-hidden rounded-lg border border-ink-950/10 bg-ink-950/[0.04]">
                    <div className="grid gap-px sm:grid-cols-2">
                      <div className="p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-800">Input</p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px]">{ex.input}</pre>
                      </div>
                      <div className="bg-white/60 p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-800">Output</p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[13px]">{ex.output}</pre>
                      </div>
                    </div>
                    {ex.explanation && <p className="border-t border-ink-950/10 px-3 py-2 text-sm text-ink-950/60">{ex.explanation}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h2 className="mt-6 font-display text-xl">Constraints</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-950/80">
            {problem.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </article>
        <Coach
          problem={problem}
          lastResults={lastResults}
          lastError={lastError}
          hintsOpen={hintsOpen}
          onUnlockHint={() => setHintsOpen((n) => Math.min(problem.hints.length, n + 1))}
        />
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
            Prefer Submit in the editor — XP from hidden tests is the real loop. This is only if you already passed the
            official problem.
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
      <div className="order-1 flex min-h-0 min-w-0 flex-1 xl:order-2">{lab}</div>
    </div>
  );
}
