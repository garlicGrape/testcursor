"use client";

import Link from "next/link";
import { reviewSchedule } from "@/lib/game";
import { useProgress } from "@/components/ProgressProvider";
import type { ReviewItem } from "@/lib/game";

function ReviewList({
  items,
  empty,
  badge,
}: {
  items: ReviewItem[];
  empty: string;
  badge: "due" | "soon" | "open";
}) {
  if (items.length === 0) {
    return <p className="mt-3 text-sm text-paper/50">{empty}</p>;
  }
  const label = badge === "due" ? "DUE" : badge === "soon" ? "SOON" : "OPEN";
  const tone = badge === "open" ? "text-ember" : badge === "soon" ? "text-violet-300" : "text-gold-400";
  return (
    <ul className="mt-3 divide-y divide-violet-500/15 rounded-2xl border border-violet-500/20 bg-ink-900/60">
      {items.map((item) => (
        <li key={item.problem.id}>
          <Link
            href={`/practice/${item.problem.id}`}
            className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-ink-800/80"
          >
            <span className={`font-mono text-xs ${tone}`}>{label}</span>
            <span className="flex-1 text-paper">{item.problem.title}</span>
            <span className="font-mono text-[11px] uppercase text-paper/45">{item.problem.difficulty}</span>
            <span className="font-mono text-[11px] text-violet-300">{item.problem.pattern}</span>
            <span className="font-mono text-[11px] text-paper/45">
              {item.overdueDays > 0
                ? `${item.overdueDays}d overdue`
                : item.overdueDays === 0
                  ? "due today"
                  : `in ${-item.overdueDays}d`}
            </span>
            <span className="font-mono text-[11px] text-paper/35">
              {item.record.attempts} try{item.record.attempts === 1 ? "" : "s"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ReviewPage() {
  const { progress, ready } = useProgress();
  const { due, upcoming, unfinished } = reviewSchedule(progress);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl">Review</h1>
      <p className="mt-2 max-w-2xl text-paper/65">
        Spaced repetition for problems you already passed in the editor. Easy waits 3 days, medium 2, hard 1 — then the
        gap doubles after each passing Submit. Unfinished rows never passed hidden tests. Redraw the approach from
        memory, then Submit. First-solve XP only pays once.
      </p>
      {!ready && <p className="mt-6 font-mono text-sm text-paper/45">Loading this browser&apos;s progress…</p>}
      {ready && due.length + upcoming.length + unfinished.length === 0 && (
        <p className="mt-8 rounded-2xl border border-violet-500/25 bg-ink-900/70 p-6 text-paper/70">
          Nothing to review yet.{" "}
          <Link href="/practice" className="text-gold-400">
            Solve a problem in the editor
          </Link>{" "}
          and it will show up here after the first interval.
        </p>
      )}
      <section className="mt-8">
        <h2 className="font-display text-2xl">Due now · {due.length}</h2>
        <ReviewList items={due} badge="due" empty="No passed problems are due today. Keep the streak with a fresh solve." />
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Unfinished · {unfinished.length}</h2>
        <ReviewList
          items={unfinished}
          badge="open"
          empty="No half-done rows. External LeetCode logs without a passing Submit land here."
        />
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl">Coming up · {upcoming.length}</h2>
        <ReviewList items={upcoming} badge="soon" empty="Nothing due in the next week." />
      </section>
    </div>
  );
}
