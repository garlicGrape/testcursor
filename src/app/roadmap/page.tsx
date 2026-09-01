"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PATTERNS } from "@/data/types";
import type { PatternId } from "@/data/types";
import { PROBLEMS } from "@/data/problems";
import { patternMastery } from "@/lib/game";
import { useProgress } from "@/components/ProgressProvider";
import type { Problem } from "@/data/types";

type ListId = "dsa" | "sql" | "onsite" | "all";

const LISTS: { id: ListId; name: string; detail: string; pred: (p: Problem) => boolean }[] = [
  {
    id: "dsa",
    name: "DSA path",
    detail: "Python patterns in interview order — hashing through backtracking.",
    pred: (p) => (p.kind ?? "python") === "python" && !p.fromUserList,
  },
  {
    id: "sql",
    name: "SQL track",
    detail: "Filter, join, aggregate, window — the DS/MLE table round.",
    pred: (p) => p.kind === "sql",
  },
  {
    id: "onsite",
    name: "Your list",
    detail: "The 19 onsite prompts you brought in.",
    pred: (p) => Boolean(p.fromUserList),
  },
  {
    id: "all",
    name: "All",
    detail: "Every runnable problem in the dojo.",
    pred: () => true,
  },
];

const DIFF_CLASS = {
  easy: "text-emerald-400",
  medium: "text-gold-400",
  hard: "text-ember",
};

export default function RoadmapPage() {
  const { progress } = useProgress();
  const [list, setList] = useState<ListId>("dsa");
  const spec = LISTS.find((item) => item.id === list) ?? LISTS[0];
  const mastery = patternMastery(progress);

  const grouped = useMemo(() => {
    const pool = PROBLEMS.filter(spec.pred);
    const byPattern = new Map<PatternId, Problem[]>();
    for (const guide of PATTERNS) byPattern.set(guide.id, []);
    for (const problem of pool) {
      const bucket = byPattern.get(problem.pattern) ?? [];
      bucket.push(problem);
      byPattern.set(problem.pattern, bucket);
    }
    return PATTERNS.map((guide) => ({
      guide,
      problems: byPattern.get(guide.id) ?? [],
    })).filter((row) => row.problems.length > 0);
  }, [spec]);

  const total = PROBLEMS.filter(spec.pred).length;
  const done = PROBLEMS.filter((p) => spec.pred(p) && progress.solved[p.id]?.localPass).length;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-400">Study like NeetCode</p>
      <h1 className="mt-2 font-display text-4xl">Roadmap</h1>
      <p className="mt-2 max-w-2xl text-paper/65">
        Work a pattern, then the next. Checkboxes are earned only by a passing Submit in the editor — not by opening
        LeetCode.com. No solution dump on this page.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {LISTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setList(item.id)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs ${
              list === item.id ? "bg-gold-400 text-ink-950" : "border border-violet-500/30 text-paper/70"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="mt-4 font-mono text-sm text-violet-300">
        {done}/{total} solved · {spec.detail}
      </p>
      <div className="mt-8 space-y-8">
        {grouped.map(({ guide, problems }) => {
          const solvedHere = problems.filter((p) => progress.solved[p.id]?.localPass).length;
          const studied = Boolean(progress.studied[guide.id]);
          const m = mastery[guide.id];
          return (
            <section key={guide.id}>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl">{guide.name}</h2>
                  <p className="mt-1 text-sm text-paper/55">{guide.tagline}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-paper/45">
                  <div>
                    {solvedHere}/{problems.length} on this list
                    {m ? ` · ${m.solved}/${m.total} in catalog` : ""}
                  </div>
                  <Link href={`/learn/${guide.id}`} className="text-gold-400">
                    {studied ? "Guide studied" : "Study the template"} →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-violet-500/20">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink-900 font-mono text-[11px] uppercase tracking-wider text-paper/45">
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Problem</th>
                      <th className="px-3 py-2 text-left">Difficulty</th>
                      <th className="px-3 py-2 text-left">Kind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((p) => {
                      const passed = Boolean(progress.solved[p.id]?.localPass);
                      return (
                        <tr
                          key={p.id}
                          className={`border-t border-violet-500/15 ${passed ? "bg-gold-400/5" : "bg-ink-900/40"}`}
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            <span className={passed ? "text-gold-400" : "text-paper/30"}>{passed ? "☑" : "☐"}</span>
                          </td>
                          <td className="px-3 py-2">
                            <Link href={`/practice/${p.id}`} className="text-paper hover:text-gold-200">
                              {p.title}
                            </Link>
                          </td>
                          <td className={`px-3 py-2 font-mono text-xs uppercase ${DIFF_CLASS[p.difficulty]}`}>
                            {p.difficulty}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-paper/45">
                            {p.kind === "sql" ? "SQL" : "Python"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
