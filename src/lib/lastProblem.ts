export const LAST_PROBLEM_KEY = "interview-dojo-last-problem";

export function readLastProblemId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_PROBLEM_KEY);
  } catch {
    return null;
  }
}

export function writeLastProblemId(id: string): void {
  try {
    window.localStorage.setItem(LAST_PROBLEM_KEY, id);
  } catch {
    /* quota / private mode */
  }
}

export function clearLastProblemId(): void {
  try {
    window.localStorage.removeItem(LAST_PROBLEM_KEY);
  } catch {
    /* ignore */
  }
}
