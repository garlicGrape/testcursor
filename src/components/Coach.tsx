"use client";

import { useMemo, useState } from "react";
import type { Problem } from "@/data/types";
import type { TestResult } from "@/lib/harness";
import { useProgress } from "./ProgressProvider";

type Msg = { who: "coach" | "you"; text: string };

const PATTERN_HINT: Record<string, string> = {
  hashing: "Think lookup: have you seen this value (or its complement) already?",
  "two-pointers": "Sorted or a pair of indices moving inward / in lockstep?",
  "sliding-window": "A subarray that grows and shrinks as you scan once?",
  stack: "Is the last unmatched thing the next one you need to resolve?",
  "binary-search": "Is there a monotonic yes/no predicate you can halve?",
  "linked-list": "Dummy head, reversal, or slow/fast pointers?",
  trees: "Recursion on left/right, or BFS if you need levels?",
  heaps: "Do you only need the current top-k, not a full sort?",
  graphs: "Grid = graph. Prerequisites = DAG. BFS vs DFS?",
  dp: "Name the state, the transition, and the base case.",
  intervals: "Sort by start, then merge or sweep.",
  backtracking: "Build, recurse, undo. Prune early.",
  "sql-select": "What is the grain of one output row? What belongs in WHERE vs SELECT?",
  "sql-joins": "INNER drops misses. LEFT keeps the left table. Say which you need.",
  "sql-agg": "GROUP BY the grain. HAVING filters aggregates. DISTINCT if ties matter.",
  "sql-window": "Keep the row, add RANK / LAG / running sum. PARTITION BY the group.",
};

export function Coach({
  problem,
  lastResults,
  lastError,
  hintsOpen,
  onUnlockHint,
}: {
  problem: Problem;
  lastResults: TestResult[] | null;
  lastError: string | null;
  hintsOpen: number;
  onUnlockHint: () => void;
}) {
  const { startCoach } = useProgress();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      who: "coach",
      text: "I'm the mock interviewer. I will not paste a solution. Restate the problem, name a pattern, then code. If tests fail, I'll interrogate the failure — not fix it for you.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"intro" | "pattern" | "code" | "grill">("intro");
  const [started, setStarted] = useState(false);

  const failed = useMemo(() => (lastResults ?? []).filter((r) => !r.ok), [lastResults]);
  const passed = lastResults && lastResults.length > 0 && lastResults.every((r) => r.ok);

  function say(who: Msg["who"], text: string) {
    setMsgs((m) => [...m, { who, text }]);
  }

  async function start() {
    if (!started) {
      setStarted(true);
      await startCoach();
    }
    setPhase("pattern");
    say(
      "coach",
      `We're doing "${problem.title}". 60 seconds: input/output, brute force, target complexity, pattern name. Type the pattern (or a one-line plan).`,
    );
  }

  function submitPlan() {
    const text = draft.trim();
    if (!text) return;
    say("you", text);
    setDraft("");
    const lower = text.toLowerCase();
    const expected = PATTERN_HINT[problem.pattern] ?? "Name the family of techniques, not the code.";
    const hit =
      lower.includes(problem.pattern.replace("sql-", "").replace("-", " ")) ||
      lower.includes(problem.pattern) ||
      (problem.pattern === "hashing" && /hash|map|dict|set|lookup/.test(lower)) ||
      (problem.pattern === "two-pointers" && /two.?pointer|left.*right|slow.*fast/.test(lower)) ||
      (problem.pattern === "sliding-window" && /window/.test(lower)) ||
      (problem.pattern === "binary-search" && /binary|halv|predicate/.test(lower)) ||
      (problem.pattern === "dp" && /dp|dynamic|state|kadane/.test(lower)) ||
      (problem.pattern.startsWith("sql-joins") && /join|left|inner/.test(lower)) ||
      (problem.pattern.startsWith("sql-agg") && /group|having|aggreg/.test(lower)) ||
      (problem.pattern.startsWith("sql-window") && /rank|window|lag|over/.test(lower)) ||
      (problem.pattern.startsWith("sql-select") && /where|select|filter/.test(lower)) ||
      (problem.pattern === "stack" && /stack|rpn|monotonic/.test(lower)) ||
      (problem.pattern === "linked-list" && /list|dummy|slow/.test(lower)) ||
      (problem.pattern === "trees" && /tree|dfs|bfs|bst|height/.test(lower)) ||
      (problem.pattern === "heaps" && /heap|kth|priority/.test(lower)) ||
      (problem.pattern === "graphs" && /graph|bfs|dfs|island/.test(lower)) ||
      (problem.pattern === "intervals" && /interval|merge|sweep/.test(lower)) ||
      (problem.pattern === "backtracking" && /backtrack|recurse|subset|permut/.test(lower));
    if (hit) {
      say("coach", `Good — that family is on the table. ${expected} Now code in the editor. Run tests. Come back if a case fails.`);
      setPhase("code");
    } else {
      say(
        "coach",
        `Not buying it yet. ${expected} Don't name the LeetCode number. Name the technique, then try again (or start coding and I'll judge from the tests).`,
      );
      setPhase("code");
    }
  }

  function diagnose() {
    if (lastError) {
      say("you", "The runtime exploded.");
      say(
        "coach",
        `That's a crash, not a wrong answer. Read the first line of the error: "${lastError.slice(0, 180)}". Syntax, NameError, and indentation are not algorithm bugs — fix the language, then rerun.`,
      );
      return;
    }
    if (!lastResults || lastResults.length === 0) {
      say("coach", "I haven't seen a Run yet. Hit Run so I have a failing case to interrogate.");
      return;
    }
    if (passed) {
      setPhase("grill");
      say("you", "Tests passed.");
      say(
        "coach",
        `Accepted. Now say time and space in one sentence. Then a follow-up: ${problem.interviewNote}`,
      );
      return;
    }
    const first = failed[0];
    say("you", `Stuck. ${lastResults.filter((r) => r.ok).length}/${lastResults.length} passed.`);
    say(
      "coach",
      `Look at "${first.name}". got ${first.got} — want ${first.want}. What assumption did you make that this case violates? Don't change code until you can say it out loud.`,
    );
    if (hintsOpen < problem.hints.length) {
      say("coach", "If you want a nudge after that, unlock one hint on the left — it costs first-solve XP. I will not dump the function.");
    }
  }

  return (
    <section className="rounded-2xl border border-gold-400/30 bg-ink-900/70 p-5">
      <h2 className="font-display text-2xl">Mock interviewer</h2>
      <p className="mt-1 text-xs text-paper/50">
        Socratic, on-device — no model API. It reads your hidden-test results and this problem&apos;s pattern. It will not
        paste a solution.
      </p>
      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {msgs.map((m, i) => (
          <p
            key={`${m.who}-${i}`}
            className={`rounded-md px-3 py-2 text-sm ${m.who === "coach" ? "bg-ink-800 text-paper/85" : "bg-gold-400/10 text-gold-200"}`}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-gold-400">{m.who}</span> {m.text}
          </p>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {phase === "intro" && (
          <button type="button" onClick={() => void start()} className="rounded-md bg-violet-600 px-3 py-1.5 font-mono text-xs">
            Start mock interview
          </button>
        )}
        {(phase === "code" || phase === "grill") && (
          <button type="button" onClick={diagnose} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
            Interrogate my last Run
          </button>
        )}
        {hintsOpen < problem.hints.length && (
          <button type="button" onClick={onUnlockHint} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
            Unlock hint {hintsOpen + 1}
          </button>
        )}
      </div>
      {phase === "pattern" && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitPlan();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Pattern + target complexity…"
            className="min-w-0 flex-1 rounded-md border border-violet-500/30 bg-ink-950 px-3 py-2 font-mono text-sm"
          />
          <button type="submit" className="rounded-md bg-gold-400 px-3 py-2 font-mono text-xs text-ink-950">
            Send
          </button>
        </form>
      )}
    </section>
  );
}
