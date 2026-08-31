"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { emptyProgress } from "@/lib/game";
import { applyProgressAction, loadProgress, saveProgress, type ProgressAction } from "@/lib/clientProgress";
import type { PatternId, Progress } from "@/data/types";

type ProgressContextValue = {
  progress: Progress;
  ready: boolean;
  refresh: () => Promise<void>;
  act: (body: ProgressAction) => Promise<Record<string, unknown>>;
  solve: (
    problemId: string,
    opts?: { hintsUsed?: number; peekedSolution?: boolean; localPass?: boolean },
  ) => Promise<Record<string, unknown>>;
  study: (patternId: PatternId) => Promise<void>;
  openResource: (resourceId: string) => Promise<void>;
  finishQuest: (questId: string) => Promise<void>;
};

const Ctx = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const ref = useRef(progress);
  ref.current = progress;

  const refresh = useCallback(async () => {
    const next = loadProgress();
    ref.current = next;
    setProgress(next);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const act = useCallback(async (body: ProgressAction) => {
    const { progress: next, extra } = applyProgressAction(ref.current, body);
    ref.current = next;
    saveProgress(next);
    setProgress(next);
    return extra;
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      ready,
      refresh,
      act,
      solve: (problemId, opts) => act({ action: "solve", problemId, ...opts }),
      study: async (patternId) => {
        await act({ action: "study", patternId });
      },
      openResource: async (resourceId) => {
        await act({ action: "resource", resourceId });
      },
      finishQuest: async (questId) => {
        await act({ action: "quest", questId });
      },
    }),
    [act, progress, ready, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
