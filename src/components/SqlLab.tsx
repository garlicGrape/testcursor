"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { getSqlSpec } from "@/data/sqlSpecs";
import { runSqlCases, warmSql, type SqlRunOutcome } from "@/lib/sqlClient";
import { makeSqlStarter, parseSqlSetup } from "@/lib/sqlPreview";
import { SqlDataset } from "./SqlDataset";
import { RunCompare } from "./DataTable";
import type { TestResult } from "@/lib/harness";

loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
});

const codeKey = (id: string) => `dojo-sql:v2:${id}`;

function isLegacyDraft(code: string): boolean {
  const trimmed = code.trim();
  return /^SELECT\s+--/i.test(trimmed) && trimmed.split("\n").length <= 2;
}

type Props = {
  problemId: string;
  hintsUsed: number;
  peeked: boolean;
  onPeekChange: (peeked: boolean) => void;
  onPassed: (opts: { hintsUsed: number; peekedSolution: boolean }) => Promise<void>;
  onResults: (results: TestResult[], error: string | null) => void;
  flash: string | null;
  alreadySolved: boolean;
};

function prefersPlainEditor(): boolean {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return window.innerWidth < 900;
}

export function SqlLab({
  problemId,
  hintsUsed,
  peeked,
  onPeekChange,
  onPassed,
  onResults,
  flash,
  alreadySolved,
}: Props) {
  const spec = getSqlSpec(problemId);
  const [code, setCode] = useState("");
  const [runtime, setRuntime] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<SqlRunOutcome | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [plain, setPlain] = useState(true);
  const [editorPx, setEditorPx] = useState(420);
  const codeRef = useRef(code);
  const hostRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<Parameters<OnMount>[0] | null>(null);
  codeRef.current = code;

  useEffect(() => {
    const apply = () => setPlain(prefersPlainEditor());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (!spec) return;
    const generated = makeSqlStarter(parseSqlSetup(spec.cases[0].setup), spec.cases[0].expected.columns);
    try {
      const saved = window.localStorage.getItem(codeKey(problemId));
      setCode(saved && saved.trim() && !isLegacyDraft(saved) ? saved : generated);
    } catch {
      setCode(generated);
    }
    setOutcome(null);
    setNote(null);
  }, [problemId, spec]);

  useEffect(() => {
    if (!code) return;
    try {
      window.localStorage.setItem(codeKey(problemId), code);
    } catch {
      /* ignore */
    }
  }, [code, problemId]);

  useEffect(() => {
    let cancelled = false;
    void warmSql().then((result) => {
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

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => {
      const next = Math.max(280, Math.round(el.getBoundingClientRect().height));
      setEditorPx(next);
      monacoRef.current?.layout();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [plain]);

  const run = useCallback(
    async (submit: boolean) => {
      if (!spec) return;
      setBusy(true);
      setNote(null);
      const result = await runSqlCases(codeRef.current, spec.cases);
      setOutcome(result);
      setBusy(false);
      onResults(result.results, result.error ?? null);
      if (result.error && result.results.length === 0) {
        setRuntime((r) => (r === "loading" ? "error" : r));
        return;
      }
      setRuntime("ready");
      const allPassed = result.results.length > 0 && result.results.every((t) => t.ok);
      if (submit) {
        if (allPassed) await onPassed({ hintsUsed, peekedSolution: peeked });
        else setNote("Submit blocked — every hidden query check has to pass.");
      }
    },
    [hintsUsed, onPassed, onResults, peeked, spec],
  );

  const onMount: OnMount = (editor, monaco) => {
    monacoRef.current = editor;
    editor.layout();
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void run(false);
    });
  };

  if (!spec) {
    return <p className="rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm">No SQL tests for this id yet.</p>;
  }

  const results: TestResult[] = outcome?.results ?? [];
  const passed = results.length > 0 && results.every((t) => t.ok) && !outcome?.error;
  const failed = results.some((t) => !t.ok);

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto rounded-2xl border border-violet-500/25 bg-ink-900/80 xl:overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-violet-500/20 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-400">SQLite</span>
        <span className="font-mono text-[11px] text-paper/45">
          {runtime === "loading" && "Loading in-browser SQL (first time ~5s)…"}
          {runtime === "ready" && "Ready · Run previews your result table"}
          {runtime === "error" && "Runtime issue — hit Run to retry"}
        </span>
        <span className="ml-auto hidden font-mono text-[11px] text-paper/35 sm:inline">Ctrl/⌘ + Enter to run</span>
      </header>
      <div className="border-b border-violet-500/20 px-3 py-2">
        <SqlDataset spec={spec} defaultOpen={plain} />
      </div>
      <div ref={hostRef} className="dojo-editor-host dojo-editor-host-sql">
        {plain ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            wrap="off"
            aria-label="SQL editor"
            className="dojo-plain-editor"
          />
        ) : (
          <Editor
            height={editorPx}
            defaultLanguage="sql"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            onMount={onMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              wordWrap: "off",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
            }}
            loading={<p className="p-4 font-mono text-xs text-paper/50">Loading editor…</p>}
          />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-violet-500/20 p-3">
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
            onClick={() =>
              setCode(makeSqlStarter(parseSqlSetup(spec.cases[0].setup), spec.cases[0].expected.columns))
            }
            className="rounded-md px-3 py-1.5 font-mono text-xs text-paper/55"
          >
            Reset starter
          </button>
          <label className="ml-auto flex items-center gap-2 text-xs text-paper/60">
            <input type="checkbox" checked={peeked} onChange={(e) => onPeekChange(e.target.checked)} />
            Peeked at a solution (25% XP)
          </label>
        </div>
        {outcome?.error && results.length === 0 && <p className="mt-3 font-mono text-xs text-ember">{outcome.error}</p>}
        {passed && (
          <p className="mt-3 font-mono text-sm text-gold-400">
            Accepted · {results.length} check{results.length === 1 ? "" : "s"} passed
          </p>
        )}
        {failed && (
          <p className="mt-3 font-mono text-sm text-ember">
            Wrong Answer · {results.filter((t) => t.ok).length}/{results.length} passed — extra columns are marked in
            red
          </p>
        )}
        {results.length > 0 && (
          <ul className="mt-2 max-h-[min(28rem,55vh)] space-y-2 overflow-auto">
            {results.map((t) => (
              <RunCompare key={t.name} result={t} />
            ))}
          </ul>
        )}
        {note && <p className="mt-2 text-sm text-violet-300">{note}</p>}
        {flash && <p className="mt-2 text-sm text-violet-300">{flash}</p>}
        {alreadySolved && !flash && (
          <p className="mt-2 font-mono text-[11px] text-paper/45">Already in your solved set — Submit still re-runs checks.</p>
        )}
      </div>
    </section>
  );
}
