"use client";

import { useEffect, useState } from "react";

const PRESETS = [15, 25, 45] as const;

export function InterviewTimer() {
  const [minutes, setMinutes] = useState<(typeof PRESETS)[number]>(25);
  const [left, setLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || left === null) return;
    if (left <= 0) {
      setRunning(false);
      return;
    }
    const id = window.setInterval(() => setLeft((n) => (n === null ? n : Math.max(0, n - 1))), 1000);
    return () => window.clearInterval(id);
  }, [running, left]);

  const mm = left === null ? minutes : Math.floor(left / 60);
  const ss = left === null ? 0 : left % 60;
  const expired = left === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-500/20 bg-ink-900/50 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-400">Interview clock</span>
      <span className={`font-mono text-sm ${expired ? "text-ember" : "text-paper"}`}>
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        {expired ? " · time" : ""}
      </span>
      {left === null &&
        PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={`rounded-md px-2 py-0.5 font-mono text-[11px] ${minutes === m ? "bg-violet-600 text-white" : "text-paper/55"}`}
          >
            {m}m
          </button>
        ))}
      {left === null ? (
        <button
          type="button"
          onClick={() => {
            setLeft(minutes * 60);
            setRunning(true);
          }}
          className="rounded-md bg-violet-600 px-2 py-0.5 font-mono text-[11px]"
        >
          Start
        </button>
      ) : (
        <>
          <button type="button" onClick={() => setRunning((r) => !r)} className="rounded-md border border-paper/20 px-2 py-0.5 font-mono text-[11px]">
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => {
              setLeft(null);
              setRunning(false);
            }}
            className="rounded-md px-2 py-0.5 font-mono text-[11px] text-paper/45"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
