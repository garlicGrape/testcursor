"use client";

import Link from "next/link";
import { PATTERNS } from "@/data/types";
import { useProgress } from "@/components/ProgressProvider";

export default function LearnIndexPage() {
  const { progress } = useProgress();
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Patterns</h1>
      <p className="mt-2 max-w-2xl text-paper/65">
        Interviews are pattern recognition plus communication. Study the template, then solve two problems from the
        catalog before moving on.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PATTERNS.map((p) => (
          <Link
            key={p.id}
            href={`/learn/${p.id}`}
            className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5 hover:border-gold-400/40"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{p.name}</h2>
              {progress.studied[p.id] && <span className="font-mono text-[11px] text-gold-400">STUDIED</span>}
            </div>
            <p className="mt-2 text-sm text-paper/65">{p.tagline}</p>
            <p className="mt-3 font-mono text-[11px] text-paper/45">
              {p.studyMinutes} min · +{p.xp} XP
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
