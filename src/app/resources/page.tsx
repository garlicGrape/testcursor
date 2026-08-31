"use client";

import { RESOURCES } from "@/data/resources";
import { useProgress } from "@/components/ProgressProvider";

export default function ResourcesPage() {
  const { progress, openResource } = useProgress();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Study library</h1>
      <p className="mt-2 max-w-2xl text-paper/65">
        Curated for coding interviews and the rounds that sit next to them (SQL, stats, ML design, behavioral). Open a
        resource to tick the librarian badge.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {RESOURCES.map((r) => {
          const seen = progress.resourcesRead.includes(r.id);
          return (
            <li key={r.id} className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl leading-tight">{r.title}</h2>
                <span className="font-mono text-[11px] uppercase text-gold-400">{r.cost}</span>
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-paper/45">
                {r.kind}
                {r.minutes ? ` · ${r.minutes} min` : ""}
              </p>
              <p className="mt-3 text-sm text-paper/70">{r.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => void openResource(r.id)}
                className="mt-4 inline-block font-mono text-xs text-gold-400"
              >
                {seen ? "Opened · open again ↗" : "Open ↗"}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
