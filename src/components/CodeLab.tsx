"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { getCoding } from "@/data/codingSpecs";
import { runUserCode, warmPyodide, type RunOutcome } from "@/lib/pyodideClient";
import type { TestResult } from "@/lib/harness";

loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
});

const codeKey = (id: string) => `dojo-code:${id}`;

type Props = {
  problemId: string;
  hintsUsed: number;
  peeked: boolean;
  onPeekChange: (peeked: boolean) => void;
  onPassed: (opts: { hintsUsed: number; peekedSolution: boolean }) => Promise<void>;
  flash: string | null;
  alreadySolved: boolean;
};

export function CodeLab({
  problemId,
  hintsUsed,
  peeked,
  onPeekChange,
  onPassed,
  flash,
  alreadySolved,
}: Props) {
  const spec = getCoding(problemId);
  const [code, setCode] = useState("");
  const [runtime, setRuntime] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  useEffect(() => {
    if (!spec) return;
    try {
      const saved = window.localStorage.getItem(codeKey(problemId));
      setCode(saved && saved.trim() ? saved : spec.starter);
    } catch {
      setCode(spec.starter);
    }
    setOutcome(null);
    setNote(null);
  }, [problemId, spec]);

  useEffect(() => {
    if (!code) return;
    try {
      window.localStorage.setItem(codeKey(problemId), code);
    } catch {
      /* quota / private mode */
    }
  }, [code, problemId]);

  useEffect(() => {
    let cancelled = false;
    void warmPyodide().then((result) => {
      if (cancelled) return;
      if (result.error && result.error.startsWith("Timed out")) {
        setRuntime("error");
        setNote(result.error);
      } else {
        setRuntime("ready");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async (submit: boolean) => {
    if (!spec) return;
    setBusy(true);
    setNote(null);
    const result = await runUserCode(codeRef.current, spec.tests, submit ? 20000 : 20000);
    setOutcome(result);
    setBusy(false);
    if (result.error) {
      setRuntime((r) => (r === "loading" ? "error" : r));
      return;
    }
    setRuntime("ready");
    const passed = result.results.length > 0 && result.results.every((t) => t.ok);
    if (submit) {
      if (passed) {
        await onPassed({ hintsUsed, peekedSolution: peeked });
      } else {
        setNote("Submit blocked — every hidden test has to pass, like LeetCode.");
      }
    }
  }, [hintsUsed, onPassed, peeked, spec]);

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void run(false);
    });
  };

  if (!spec) {
    return (
      <p className="rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm">
        No in-browser tests for this id yet.
      </p>
    );
  }

  const results: TestResult[] = outcome?.results ?? [];
  const passed = results.length > 0 && results.every((t) => t.ok) && !outcome?.error;
  const failed = results.some((t) => !t.ok);

  return (
    <section className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-violet-500/25 bg-ink-900/80">
      <header className="flex flex-wrap items-center gap-2 border-b border-violet-500/20 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-400">Python 3</span>
        <span className="font-mono text-[11px] text-paper/45">
          {runtime === "loading" && "Loading in-browser Python (first time ~10s)…"}
          {runtime === "ready" && "Runtime ready · hidden tests"}
          {runtime === "error" && "Runtime issue — hit Run to retry"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-paper/35">Ctrl/⌘ + Enter to run</span>
      </header>
      <div className="min-h-[240px] flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          onMount={onMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "IBM Plex Mono, ui-monospace, monospace",
          }}
          loading={<p className="p-4 font-mono text-xs text-paper/50">Loading editor…</p>}
        />
      </div>
      <div className="border-t border-violet-500/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(false)}
            className="rounded-md border border-paper/20 px-3 py-1.5 font-mono text-xs disabled:opacity-40"
          >
            {busy ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(true)}
            className="rounded-md bg-gold-400 px-3 py-1.5 font-mono text-xs text-ink-950 disabled:opacity-40"
          >
            Submit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setCode(spec.starter)}
            className="rounded-md px-3 py-1.5 font-mono text-xs text-paper/55 hover:text-paper"
          >
            Reset starter
          </button>
          <label className="ml-auto flex items-center gap-2 text-xs text-paper/60">
            <input type="checkbox" checked={peeked} onChange={(e) => onPeekChange(e.target.checked)} />
            Peeked at a solution (25% XP)
          </label>
        </div>
        {outcome?.error && <p className="mt-3 font-mono text-xs text-ember">{outcome.error}</p>}
        {passed && (
          <p className="mt-3 font-mono text-sm text-gold-400">
            Accepted · {results.length} hidden test{results.length === 1 ? "" : "s"} passed
          </p>
        )}
        {failed && (
          <p className="mt-3 font-mono text-sm text-ember">
            Wrong Answer · {results.filter((t) => t.ok).length}/{results.length} passed
          </p>
        )}
        {results.length > 0 && (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-[11px]">
            {results.map((t) => (
              <li
                key={t.name}
                className={`rounded-md px-2 py-1 ${t.ok ? "bg-gold-400/10 text-gold-200" : "bg-ember/15 text-ember"}`}
              >
                <span className="mr-2">{t.ok ? "PASS" : "FAIL"}</span>
                {t.name}
                {!t.ok && (
                  <div className="mt-1 whitespace-pre-wrap text-paper/70">
                    got {t.got}
                    {"\n"}want {t.want}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {note && <p className="mt-2 text-sm text-violet-300">{note}</p>}
        {flash && <p className="mt-2 text-sm text-violet-300">{flash}</p>}
        {alreadySolved && !flash && (
          <p className="mt-2 font-mono text-[11px] text-paper/45">Already in your solved set — Submit still re-runs tests.</p>
        )}
      </div>
    </section>
  );
}
