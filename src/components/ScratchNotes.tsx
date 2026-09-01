"use client";

import { useEffect, useState } from "react";

const noteKey = (id: string) => `dojo-notes:${id}`;

export function ScratchNotes({ problemId }: { problemId: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    try {
      setText(window.localStorage.getItem(noteKey(problemId)) ?? "");
    } catch {
      setText("");
    }
  }, [problemId]);

  function save(next: string) {
    setText(next);
    try {
      if (next) window.localStorage.setItem(noteKey(problemId), next);
      else window.localStorage.removeItem(noteKey(problemId));
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
      <h2 className="font-display text-2xl">Scratch pad</h2>
      <p className="mt-1 text-xs text-paper/50">
        Talking points only — brute force, pattern, complexity. This stays in this browser. Do not paste a full solution.
      </p>
      <textarea
        value={text}
        onChange={(e) => save(e.target.value)}
        rows={5}
        spellCheck={false}
        placeholder="I/O in one sentence. Brute force. Pattern + invariant. Edge cases. Time / space."
        className="mt-3 w-full resize-y rounded-md border border-violet-500/30 bg-ink-950 px-3 py-2 font-mono text-sm text-paper/90"
      />
    </section>
  );
}
