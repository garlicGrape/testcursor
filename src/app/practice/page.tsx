"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PROBLEMS } from "@/data/problems";
import type { Difficulty, PatternId, ProblemKind } from "@/data/types";
import { PATTERNS } from "@/data/types";
import { useProgress } from "@/components/ProgressProvider";

export default function PracticePage() {
  const { progress } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [pattern, setPattern] = useState<PatternId | "all">("all");
  const [list, setList] = useState<"all" | "user" | "core" | "sql">("all");
  const [status, setStatus] = useState<"all" | "todo" | "done">("all");
  const [kind, setKind] = useState<ProblemKind | "all">("all");

  const rows = useMemo(() => {
    return PROBLEMS.filter((p) => {
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (pattern !== "all" && p.pattern !== pattern) return false;
      if (list === "user" && !p.fromUserList) return false;
      if (list === "core" && (p.fromUserList || p.kind === "sql")) return false;
      if (list === "sql" && p.kind !== "sql") return false;
      if (kind !== "all" && (p.kind ?? "python") !== kind) return false;
      const done = Boolean(progress.solved[p.id]);
      if (status === "todo" && done) return false;
      if (status === "done" && !done) return false;
      return true;
    });
  }, [difficulty, kind, list, pattern, progress.solved, status]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Practice</h1>
      <p className="mt-2 max-w-2xl text-paper/65">
        Open a problem and write Python or SQL in the editor — hidden tests run in the browser. Submit banks XP only
        when every check passes. Use the mock interviewer on the problem page.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <select
          className="rounded-md border border-violet-500/30 bg-ink-900 px-3 py-2 font-mono text-sm"
          value={kind}
          onChange={(e) => setKind(e.target.value as ProblemKind | "all")}
        >
          <option value="all">Python + SQL</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
        </select>
        <select
          className="rounded-md border border-violet-500/30 bg-ink-900 px-3 py-2 font-mono text-sm"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")}
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          className="rounded-md border border-violet-500/30 bg-ink-900 px-3 py-2 font-mono text-sm"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as PatternId | "all")}
        >
          <option value="all">All patterns</option>
          {PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-violet-500/30 bg-ink-900 px-3 py-2 font-mono text-sm"
          value={list}
          onChange={(e) => setList(e.target.value as "all" | "user" | "core" | "sql")}
        >
          <option value="all">All lists</option>
          <option value="user">Your list (19)</option>
          <option value="core">Core + grind</option>
          <option value="sql">SQL track</option>
        </select>
        <select
          className="rounded-md border border-violet-500/30 bg-ink-900 px-3 py-2 font-mono text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "todo" | "done")}
        >
          <option value="all">All statuses</option>
          <option value="todo">Unsolved</option>
          <option value="done">Solved</option>
        </select>
      </div>
      <ul className="mt-6 divide-y divide-violet-500/15 rounded-2xl border border-violet-500/20 bg-ink-900/60">
        {rows.map((p) => {
          const done = Boolean(progress.solved[p.id]);
          return (
            <li key={p.id}>
              <Link href={`/practice/${p.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-ink-800/80">
                <span className={`font-mono text-xs ${done ? "text-gold-400" : "text-paper/35"}`}>{done ? "DONE" : "TODO"}</span>
                <span className="flex-1 text-paper">{p.title}</span>
                <span className="font-mono text-[11px] uppercase text-paper/45">{p.difficulty}</span>
                <span className="font-mono text-[11px] text-violet-300">{p.pattern}</span>
                <span className="font-mono text-[11px] text-gold-400">{p.xp} XP</span>
                {p.fromUserList && (
                  <span className="rounded-full bg-gold-400/15 px-2 py-0.5 font-mono text-[10px] text-gold-200">your list</span>
                )}
                <span className="rounded-full bg-violet-600/30 px-2 py-0.5 font-mono text-[10px]">
                  {p.kind === "sql" ? "SQL" : "code here"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
