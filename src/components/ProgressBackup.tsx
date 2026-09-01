"use client";

import { useRef, useState } from "react";
import { emptyProgress } from "@/lib/game";
import { PROGRESS_KEY, saveProgress } from "@/lib/clientProgress";
import { LAST_PROBLEM_KEY } from "@/lib/lastProblem";
import { useProgress } from "./ProgressProvider";
import type { Progress } from "@/data/types";

function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const p = value as Progress;
  return typeof p.xp === "number" && p.solved !== undefined && typeof p.solved === "object";
}

export function ProgressBackup() {
  const { progress, refresh } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);

  function exportJson() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-dojo-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProgress(parsed)) {
        setNote("That file is not a Dojo progress export.");
        return;
      }
      saveProgress({ ...emptyProgress(), ...parsed });
      await refresh();
      setNote("Progress restored from file.");
    } catch {
      setNote("Could not read that file.");
    }
  }

  function reset() {
    if (!window.confirm("Erase XP, streak, and solves in this browser?")) return;
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(LAST_PROBLEM_KEY);
    saveProgress(emptyProgress());
    void refresh();
    setNote("Progress cleared.");
  }

  return (
    <section className="mt-10 rounded-2xl border border-violet-500/25 bg-ink-900/70 p-5">
      <h2 className="font-display text-2xl">This browser</h2>
      <p className="mt-2 text-sm text-paper/65">
        Progress lives in localStorage. Export a JSON backup before you clear cookies or switch machines.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={exportJson} className="rounded-md bg-violet-600 px-3 py-1.5 font-mono text-xs">
          Export progress
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs">
          Import JSON
        </button>
        <button type="button" onClick={reset} className="rounded-md px-3 py-1.5 font-mono text-xs text-ember">
          Reset this browser
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importJson(file);
            e.target.value = "";
          }}
        />
      </div>
      {note && <p className="mt-3 font-mono text-xs text-gold-400">{note}</p>}
    </section>
  );
}
