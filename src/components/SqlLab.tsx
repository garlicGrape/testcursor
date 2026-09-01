"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { getSqlSpec } from "@/data/sqlSpecs";
import { runSqlCases, warmSql, type SqlRunOutcome } from "@/lib/sqlClient";
import { makeSqlStarter, parseSqlSetup } from "@/lib/sqlPreview";
import { SqlDataset } from "./SqlDataset";
import { RunCompare } from "./DataTable";
import { LabSplit, LabToolbar } from "./LabSplit";
import type { TestResult } from "@/lib/harness";

loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
});

const codeKey = (id: string) => `dojo-sql:v3:${id}`;

function isLegacyDraft(code: string): boolean {
  const trimmed = code.trim();
  return (/^SELECT\s+--/i.test(trimmed) && trimmed.split("\n").length <= 2) || /\bTRUE;/.test(trimmed);
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
      const next = Math.max(120, Math.round(el.getBoundingClientRect().height));
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
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      void run(true);
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
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-violet-500/20 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-400">SQLite</span>
        <span className="font-mono text-[11px] text-paper/45">
          {runtime === "loading" && "Loading in-browser SQL (first time ~5s)…"}
          {runtime === "ready" && "Ready · Run previews your result table"}
          {runtime === "error" && "Runtime issue — hit Run to retry"}
        </span>
        <span className="ml-auto hidden font-mono text-[11px] text-paper/35 sm:inline">Ctrl/⌘+Enter run · +Shift submit</span>
      </header>
      <div className="max-h-40 shrink-0 overflow-y-auto border-b border-violet-500/20 px-3 py-2 xl:max-h-28">
        <SqlDataset spec={spec} defaultOpen={false} />
      </div>
      <LabSplit
        top={
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
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const t = e.currentTarget;
                    const start = t.selectionStart;
                    const end = t.selectionEnd;
                    const next = `${code.slice(0, start)}  ${code.slice(end)}`;
                    setCode(next);
                    requestAnimationFrame(() => {
                      t.selectionStart = t.selectionEnd = start + 2;
                    });
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void run(e.shiftKey);
                  }
                }}
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
        }
        bottom={
          <div className="flex flex-col bg-ink-900 xl:h-full xl:overflow-hidden">
            <LabToolbar
              busy={busy}
              peeked={peeked}
              onPeekChange={onPeekChange}
              onRun={() => void run(false)}
              onSubmit={() => void run(true)}
              onReset={() =>
                setCode(makeSqlStarter(parseSqlSetup(spec.cases[0].setup), spec.cases[0].expected.columns))
              }
            />
            <div className="px-4 py-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
              {outcome?.error && results.length === 0 && <p className="font-mono text-sm text-ember">{outcome.error}</p>}
              {passed && (
                <p className="font-mono text-sm text-gold-400">
                  Accepted · {results.length} check{results.length === 1 ? "" : "s"} passed
                </p>
              )}
              {failed && (
                <p className="font-mono text-sm text-ember">
                  Wrong Answer · {results.filter((t) => t.ok).length}/{results.length} passed — extra columns are marked
                  in red
                </p>
              )}
              {results.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {results.map((t) => (
                    <RunCompare key={t.name} result={t} />
                  ))}
                </ul>
              )}
              {note && <p className="mt-2 text-sm text-violet-300">{note}</p>}
              {flash && <p className="mt-2 text-sm text-violet-300">{flash}</p>}
              {alreadySolved && !flash && (
                <p className="mt-2 font-mono text-[11px] text-paper/45">
                  Already in your solved set — Submit still re-runs checks.
                </p>
              )}
            </div>
          </div>
        }
      />
    </section>
  );
}
