"use client";

import Link from "next/link";
import { dailyQuests, isQuestDone } from "@/lib/game";
import { useProgress } from "@/components/ProgressProvider";

export default function QuestsPage() {
  const { progress } = useProgress();
  const quests = dailyQuests(progress);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl">Daily quests</h1>
      <p className="mt-2 text-paper/65">
        Four things, every day. XP lands automatically when you Submit a passing solution or mark a guide studied —
        there is no Claim button. Overdue solves also live on{" "}
        <Link href="/review" className="text-gold-400">
          Review
        </Link>
        .
      </p>
      <ol className="mt-8 space-y-4">
        {quests.map((q, i) => {
          const done = isQuestDone(progress, q.id);
          return (
            <li
              key={q.id}
              className={`rounded-2xl border p-5 ${done ? "border-gold-400/40 bg-gold-400/5" : "border-violet-500/25 bg-ink-900/70"}`}
            >
              <div className="font-mono text-[11px] text-gold-400">
                {String(i + 1).padStart(2, "0")} · {q.kind}
              </div>
              <h2 className="mt-1 font-display text-2xl">{q.title}</h2>
              <p className="mt-2 text-sm text-paper/65">{q.detail}</p>
              <p className="mt-1 text-xs text-paper/45">{done ? `Earned +${q.xp} XP` : q.how}</p>
              <div className="mt-4">
                <Link href={q.href} className="rounded-md bg-violet-600 px-3 py-1.5 font-mono text-xs">
                  {done ? "Open again" : "Go do it"}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
