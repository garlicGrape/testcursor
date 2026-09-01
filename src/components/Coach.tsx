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

const DRILLS = [
  "Restate the input and the output in one sentence. What is one return value?",
  "What's the brute force, and why is it too slow for the constraints?",
  "Name the pattern and the invariant you will maintain while you scan.",
  "Which edge case will the interviewer throw first?",
  "Walk example 1 out loud before you touch the editor.",
  "After it passes: time, extra space, and one follow-up. No code dump.",
];

function patternHit(problem: Problem, lower: string): boolean {
  return (
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
    (problem.pattern === "backtracking" && /backtrack|recurse|subset|permut/.test(lower))
  );
}

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
      text: "I'm the mock interviewer. I will not paste a solution. Restate the problem, name a pattern, then code. Keep talking — I read your hidden-test results. I will not dump the function.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"intro" | "live">("intro");
  const [started, setStarted] = useState(false);
  const [drill, setDrill] = useState(0);

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
    setPhase("live");
    say(
      "coach",
      `We're doing "${problem.title}". 60 seconds: input/output, brute force, target complexity, pattern name. Type a plan, ask about a failing test, or say "complexity" after you pass.`,
    );
  }

  function diagnose(announceYou = true) {
    if (lastError) {
      if (announceYou) say("you", "The runtime exploded.");
      say(
        "coach",
        `That's a crash, not a wrong answer. Read the first line: "${lastError.slice(0, 180)}". Syntax and NameError are language bugs — fix those, then rerun.`,
      );
      return;
    }
    if (!lastResults || lastResults.length === 0) {
      say("coach", "I haven't seen a Run yet. Hit Run so I have a case to interrogate.");
      return;
    }
    if (passed) {
      if (announceYou) say("you", "Tests passed.");
      say(
        "coach",
        `Accepted. Say time and space in one sentence. Then a follow-up: ${problem.interviewNote}`,
      );
      return;
    }
    const first = failed[0];
    if (announceYou) say("you", `Stuck. ${lastResults.filter((r) => r.ok).length}/${lastResults.length} passed.`);
    say(
      "coach",
      `Look at "${first.name}". got ${first.got} — want ${first.want}. What assumption did you make that this case violates? Don't change code until you can say it out loud.`,
    );
    if (hintsOpen < problem.hints.length) {
      say("coach", "Need a nudge after that? Unlock one hint — it costs first-solve XP. I still will not dump the function.");
    }
  }

  function reply(text: string) {
    const lower = text.toLowerCase();
    const expected = PATTERN_HINT[problem.pattern] ?? "Name the family of techniques, not the code.";

    if (/^(hint|nudge|stuck|help)\b/.test(lower) || /\bhint\b/.test(lower)) {
      if (hintsOpen < problem.hints.length) {
        onUnlockHint();
        say("coach", `Hint ${hintsOpen + 1} is now unlocked on the left. Read it, then tell me what it changes in your plan. I still will not write the code.`);
      } else {
        say("coach", "You're out of canned hints. Walk the failing case by hand on one example. What value is wrong?");
      }
      return;
    }

    if (/\b(fail|failed|wrong|test|run|wa|error|traceback)\b/.test(lower)) {
      diagnose(false);
      return;
    }

    if (/\b(complex|big-?o|o\(|time and space|runtime)\b/.test(lower)) {
      if (problem.kind === "sql") {
        say("coach", "For SQL, say the grain, the join type, and whether you scan once or explode rows. Indexes are a follow-up, not an excuse to skip the predicate.");
      } else {
        say("coach", "Say time and extra memory in one sentence, then the brute force you beat. If you cannot name the bottleneck, you are not done.");
      }
      return;
    }

    if (/\b(brute|naive|follow-?up|edge|constraint)\b/.test(lower)) {
      say("coach", problem.interviewNote);
      return;
    }

    if (/\b(solution|give me the code|write it|answer is)\b/.test(lower)) {
      say("coach", "No. Restate the invariant. If tests failed, interrogate the first FAIL. If they passed, quote complexity.");
      return;
    }

    if (patternHit(problem, lower)) {
      say("coach", `Good — that family is on the table. ${expected} Code in the editor. Run. If a case fails, tell me or hit Interrogate.`);
      return;
    }

    say("coach", `${expected} Don't name the LeetCode number. Name the technique, or paste what you think the failing case is doing.`);
  }

  function askDrill() {
    const q = DRILLS[drill % DRILLS.length];
    setDrill((n) => n + 1);
    say("coach", q);
  }

  function submitLine() {
    const text = draft.trim();
    if (!text) return;
    say("you", text);
    setDraft("");
    reply(text);
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
        {phase === "live" && (
          <>
            <button type="button" onClick={() => diagnose(true)} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
              Interrogate my last Run
            </button>
            <button type="button" onClick={askDrill} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
              Ask me a question
            </button>
          </>
        )}
        {hintsOpen < problem.hints.length && (
          <button type="button" onClick={onUnlockHint} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
            Unlock hint {hintsOpen + 1}
          </button>
        )}
      </div>
      {phase === "live" && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitLine();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Plan, complexity, or ask about a failing test…"
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
