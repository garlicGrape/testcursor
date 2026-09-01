import { PROBLEM_BY_ID } from "@/data/problems";
import type { PatternId, Progress } from "@/data/types";
import {
  completeQuest,
  emptyProgress,
  recordResource,
  recordReview,
  recordSolve,
  recordStudy,
  recordCoach,
} from "@/lib/game";

export const PROGRESS_KEY = "interview-dojo-progress";

export type ProgressAction =
  | { action: "solve"; problemId: string; hintsUsed?: number; peekedSolution?: boolean; localPass?: boolean }
  | { action: "study"; patternId: PatternId }
  | { action: "resource"; resourceId: string }
  | { action: "quest"; questId: string }
  | { action: "review" }
  | { action: "coach" };

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function applyProgressAction(
  progress: Progress,
  body: ProgressAction,
): { progress: Progress; extra: Record<string, unknown> } {
  if (body.action === "solve") {
    const problem = PROBLEM_BY_ID[body.problemId];
    if (!problem) return { progress, extra: { error: "unknown problem" } };
    const result = recordSolve(progress, problem, {
      hintsUsed: body.hintsUsed ?? 0,
      peekedSolution: Boolean(body.peekedSolution),
      localPass: Boolean(body.localPass),
    });
    return {
      progress: result.progress,
      extra: { xpEarned: result.xpEarned, firstSolve: result.firstSolve, newly: result.newly },
    };
  }
  if (body.action === "study") {
    return { progress: recordStudy(progress, body.patternId), extra: {} };
  }
  if (body.action === "resource") {
    return { progress: recordResource(progress, body.resourceId), extra: {} };
  }
  if (body.action === "quest") {
    return { progress: completeQuest(progress, body.questId), extra: {} };
  }
  if (body.action === "review") {
    return { progress: recordReview(progress), extra: {} };
  }
  if (body.action === "coach") {
    return { progress: recordCoach(progress), extra: {} };
  }
  return { progress, extra: { error: "unknown action" } };
}
