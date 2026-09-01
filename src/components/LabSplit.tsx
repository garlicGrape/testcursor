"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const SPLIT_KEY = "dojo-lab-split";
const DEFAULT_RATIO = 0.62;
const MIN_RATIO = 0.28;
const MAX_RATIO = 0.78;

function clampRatio(value: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));
}

export function LabSplit({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startRatio: number } | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    try {
      const saved = Number(window.localStorage.getItem(SPLIT_KEY));
      if (Number.isFinite(saved)) setRatio(clampRatio(saved));
    } catch {
      /* ignore */
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!desktop) return;
    try {
      window.localStorage.setItem(SPLIT_KEY, String(ratio));
    } catch {
      /* ignore */
    }
  }, [desktop, ratio]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    const wrap = wrapRef.current;
    if (!drag || !wrap) return;
    const height = wrap.getBoundingClientRect().height;
    if (height < 120) return;
    setRatio(clampRatio(drag.startRatio + (event.clientY - drag.startY) / height));
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  if (!desktop) {
    return (
      <>
        {top}
        {bottom}
      </>
    );
  }

  return (
    <div ref={wrapRef} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 overflow-hidden" style={{ flex: `${ratio} 1 0%` }}>
        {top}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize editor and output"
        aria-valuemin={Math.round(MIN_RATIO * 100)}
        aria-valuemax={Math.round(MAX_RATIO * 100)}
        aria-valuenow={Math.round(ratio * 100)}
        tabIndex={0}
        onPointerDown={(event) => {
          event.preventDefault();
          dragRef.current = { startY: event.clientY, startRatio: ratio };
          document.body.style.cursor = "row-resize";
          document.body.style.userSelect = "none";
        }}
        onDoubleClick={() => setRatio(DEFAULT_RATIO)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setRatio((current) => clampRatio(current - 0.04));
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setRatio((current) => clampRatio(current + 0.04));
          }
        }}
        className="group flex h-4 shrink-0 cursor-row-resize items-center justify-center border-y border-violet-500/30 bg-ink-950 hover:bg-violet-600/35"
      >
        <span className="h-1.5 w-14 rounded-full bg-paper/45 group-hover:bg-gold-400" />
      </div>
      <div className="flex min-h-[12.5rem] flex-col overflow-hidden" style={{ flex: `${1 - ratio} 1 0%` }}>
        {bottom}
      </div>
    </div>
  );
}

export function LabToolbar({
  busy,
  onRun,
  onSubmit,
  onReset,
  peeked,
  onPeekChange,
}: {
  busy: boolean;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  peeked: boolean;
  onPeekChange: (peeked: boolean) => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-violet-400/30 bg-ink-800 px-4 py-3">
      <button
        type="button"
        disabled={busy}
        onClick={onRun}
        className="rounded-md border-2 border-paper/50 bg-ink-950 px-4 py-2 font-mono text-sm text-paper disabled:opacity-40"
      >
        {busy ? "Running…" : "Run"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onSubmit}
        className="rounded-md bg-gold-400 px-4 py-2 font-mono text-sm font-medium text-ink-950 disabled:opacity-40"
      >
        Submit
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onReset}
        className="rounded-md border border-paper/30 px-3 py-2 font-mono text-sm text-paper/85 hover:bg-ink-700 hover:text-paper disabled:opacity-40"
      >
        Reset starter
      </button>
      <label className="ml-auto flex items-center gap-2 text-sm text-paper/85">
        <input
          type="checkbox"
          className="h-4 w-4 accent-gold-400"
          checked={peeked}
          onChange={(event) => onPeekChange(event.target.checked)}
        />
        Peeked at a solution (25% XP)
      </label>
    </div>
  );
}
