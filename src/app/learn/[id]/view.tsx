"use client";

import Link from "next/link";
import { PROBLEMS } from "@/data/problems";
import { PATTERNS } from "@/data/types";
import { useProgress } from "@/components/ProgressProvider";

export function PatternView({ id }: { id: string }) {
  const guide = PATTERNS.find((p) => p.id === id);
  const { progress, study } = useProgress();

  if (!guide) return <p>Unknown pattern.</p>;

  const related = PROBLEMS.filter((p) => p.pattern === guide.id || p.patterns.includes(guide.id));
  const studied = Boolean(progress.studied[guide.id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/learn" className="font-mono text-xs text-paper/50">
        ← Patterns
      </Link>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-gold-400">Study guide</p>
      <h1 className="mt-2 font-display text-4xl">{guide.name}</h1>
      <p className="mt-3 text-lg text-paper/75">{guide.tagline}</p>
      <section className="mt-8 rounded-2xl border border-violet-500/25 bg-ink-900/70 p-6">
        <h2 className="font-display text-2xl">When to reach for it</h2>
        <p className="mt-2 text-paper/75">{guide.whenToUse}</p>
      </section>
      <section className="mt-4 rounded-2xl bg-ink-950 p-5">
        <h2 className="font-mono text-xs uppercase tracking-wider text-gold-400">Interview template</h2>
        <pre className="mt-3 overflow-x-auto font-mono text-sm leading-relaxed text-paper/90">
          <code>{guide.template}</code>
        </pre>
      </section>
      <section className="mt-4 rounded-2xl border border-violet-500/25 bg-ink-900/70 p-6">
        <h2 className="font-display text-2xl">Pitfalls</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-paper/75">
          {guide.pitfalls.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="mt-4">
        <h2 className="font-display text-2xl">Drill these</h2>
        <ul className="mt-3 space-y-2">
          {related.map((p) => (
            <li key={p.id}>
              <Link href={`/practice/${p.id}`} className="font-mono text-sm text-violet-300 hover:text-gold-200">
                {p.title} · {p.difficulty}
                {progress.solved[p.id] ? " · done" : ""}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <button
        type="button"
        disabled={studied}
        onClick={() => void study(guide.id)}
        className="mt-8 rounded-md bg-gold-400 px-4 py-2 font-mono text-sm text-ink-950 disabled:opacity-40"
      >
        {studied ? "Already studied" : `Mark studied · +${guide.xp} XP`}
      </button>
    </div>
  );
}
