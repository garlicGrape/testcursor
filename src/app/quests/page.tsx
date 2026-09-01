"use client";

import Link from "next/link";
import { dailyQuests, isQuestDone } from "@/lib/game";
import { useProgress } from "@/components/ProgressProvider";

export default function QuestsPage() {
  const { progress, finishQuest } = useProgress();
  const quests = dailyQuests(progress);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl">Daily quests</h1>
      <p className="mt-2 text-paper/65">
        Four things, every day: one coding problem, one SQL drill, one pattern, one review. Claim XP after you actually
        do the work — the board cannot tell if you skipped the hard part.
      </p>
      <ol className="mt-8 space-y-4">
        {quests.map((q, i) => {
          const done = isQuestDone(progress, q.id);
          return (
            <li key={q.id} className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
              <div className="font-mono text-[11px] text-gold-400">
                {String(i + 1).padStart(2, "0")} · {q.kind}
              </div>
              <h2 className="mt-1 font-display text-2xl">{q.title}</h2>
              <p className="mt-2 text-sm text-paper/65">{q.detail}</p>
              <div className="mt-4 flex gap-2">
                <Link href={q.href} className="rounded-md bg-violet-600 px-3 py-1.5 font-mono text-xs">
                  Go
                </Link>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => void finishQuest(q.id)}
                  className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs disabled:opacity-40"
                >
                  {done ? "Claimed" : `Claim +${q.xp} XP`}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
