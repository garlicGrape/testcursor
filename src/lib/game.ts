import { ACHIEVEMENTS, DIFFICULTY_XP, PATTERNS, RANKS, XP_PER_LEVEL } from "@/data/types";
import type { PatternId, Problem, Progress, Rank, SolveRecord } from "@/data/types";
import { PROBLEMS } from "@/data/problems";

export function emptyProgress(): Progress {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    solved: {},
    studied: {},
    resourcesRead: [],
    achievements: [],
    questLog: {},
    reviewCount: 0,
    coachSessions: 0,
  };
}

export function todayStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export function xpIntoLevel(xp: number): number {
  return Math.max(0, xp) % XP_PER_LEVEL;
}

export function rankForLevel(level: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (level >= rank.level) current = rank;
  }
  return current;
}

export function hintMultiplier(hintsUsed: number, peekedSolution: boolean): number {
  if (peekedSolution) return 0.25;
  if (hintsUsed <= 0) return 1;
  if (hintsUsed === 1) return 0.85;
  if (hintsUsed === 2) return 0.7;
  return 0.5;
}

export function xpForSolve(problem: Problem, hintsUsed: number, peekedSolution: boolean): number {
  const base = problem.xp || DIFFICULTY_XP[problem.difficulty];
  return Math.max(10, Math.round(base * hintMultiplier(hintsUsed, peekedSolution)));
}

export function bumpStreak(progress: Progress, today = todayStamp()): Progress {
  const next = { ...progress };
  if (next.lastActiveDate === today) return next;
  const yesterday = new Date(`${today}T12:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yStamp = yesterday.toISOString().slice(0, 10);
  next.streak = next.lastActiveDate === yStamp ? next.streak + 1 : 1;
  next.lastActiveDate = today;
  return next;
}

export function patternMastery(progress: Progress): Record<PatternId, { solved: number; total: number }> {
  const out = {} as Record<PatternId, { solved: number; total: number }>;
  for (const guide of PATTERNS) {
    const bucket = PROBLEMS.filter((p) => p.patterns.includes(guide.id) || p.pattern === guide.id);
    out[guide.id] = {
      total: bucket.length,
      solved: bucket.filter((p) => progress.solved[p.id]).length,
    };
  }
  return out;
}

function countSolved(progress: Progress, pred: (p: Problem) => boolean): number {
  return PROBLEMS.filter((p) => progress.solved[p.id] && pred(p)).length;
}

export function evaluateAchievements(progress: Progress): string[] {
  const unlocked = new Set(progress.achievements);
  const add = (id: string) => unlocked.add(id);
  const solvedIds = Object.keys(progress.solved);
  if (solvedIds.length >= 1) add("first-blood");
  if (progress.streak >= 3) add("streak-3");
  if (progress.streak >= 7) add("streak-7");
  if (progress.streak >= 30) add("streak-30");
  if (countSolved(progress, (p) => p.difficulty === "easy") >= 5) add("easy-5");
  if (countSolved(progress, (p) => p.difficulty === "medium") >= 5) add("medium-5");
  if (countSolved(progress, (p) => p.difficulty === "hard") >= 1) add("hard-1");
  if (countSolved(progress, (p) => p.pattern === "hashing") >= 3) add("hashing-3");
  if (countSolved(progress, (p) => p.pattern === "sliding-window") >= 3) add("window-3");
  if (countSolved(progress, (p) => p.pattern === "graphs") >= 2) add("graph-2");
  if (countSolved(progress, (p) => p.pattern === "dp") >= 2) add("dp-2");
  if (
    Object.values(progress.solved).some((s, i) => {
      const id = solvedIds[i];
      const problem = PROBLEMS.find((p) => p.id === id);
      return problem?.difficulty === "medium" && s.hintsUsed === 0 && !s.peekedSolution;
    })
  ) {
    add("no-hints");
  }
  if (Object.values(progress.solved).some((s) => s.localPass)) add("local-runner");
  if (Object.keys(progress.studied).length >= 4) add("scholar");
  if (progress.resourcesRead.length >= 5) add("librarian");
  if (progress.reviewCount >= 3) add("reviewer");
  if (solvedIds.length >= 12) add("catalog-12");
  if (solvedIds.length >= 40) add("catalog-40");
  if (countSolved(progress, (p) => (p.kind ?? "python") === "sql") >= 3) add("sql-3");
  if ((progress.coachSessions ?? 0) >= 3) add("coach-3");
  return Array.from(unlocked);
}

export function grantNewAchievements(progress: Progress): { progress: Progress; newly: string[] } {
  const before = new Set(progress.achievements);
  const all = evaluateAchievements(progress);
  const newly = all.filter((id) => !before.has(id));
  let xp = progress.xp;
  for (const id of newly) {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (def) xp += def.xp;
  }
  return { progress: { ...progress, xp, achievements: all }, newly };
}

export function recordSolve(
  progress: Progress,
  problem: Problem,
  opts: { hintsUsed: number; peekedSolution: boolean; localPass: boolean; now?: Date },
): { progress: Progress; xpEarned: number; firstSolve: boolean; newly: string[] } {
  const firstSolve = !progress.solved[problem.id];
  let next = bumpStreak(progress, todayStamp(opts.now));
  const xpEarned = firstSolve ? xpForSolve(problem, opts.hintsUsed, opts.peekedSolution) : 0;
  const record: SolveRecord = next.solved[problem.id]
    ? {
        ...next.solved[problem.id],
        attempts: next.solved[problem.id].attempts + 1,
        localPass: next.solved[problem.id].localPass || opts.localPass,
      }
    : {
        solvedAt: todayStamp(opts.now),
        attempts: 1,
        hintsUsed: opts.hintsUsed,
        peekedSolution: opts.peekedSolution,
        xpEarned,
        localPass: opts.localPass,
      };
  next = {
    ...next,
    xp: next.xp + xpEarned,
    solved: { ...next.solved, [problem.id]: record },
  };
  const granted = grantNewAchievements(next);
  return { progress: granted.progress, xpEarned, firstSolve, newly: granted.newly };
}

export function recordStudy(progress: Progress, patternId: PatternId, now = new Date()): Progress {
  if (progress.studied[patternId]) return bumpStreak(progress, todayStamp(now));
  const guide = PATTERNS.find((p) => p.id === patternId);
  let next: Progress = {
    ...bumpStreak(progress, todayStamp(now)),
    xp: progress.xp + (guide?.xp ?? 40),
    studied: { ...progress.studied, [patternId]: todayStamp(now) },
  };
  return grantNewAchievements(next).progress;
}

export function recordResource(progress: Progress, resourceId: string, now = new Date()): Progress {
  if (progress.resourcesRead.includes(resourceId)) return progress;
  let next: Progress = {
    ...bumpStreak(progress, todayStamp(now)),
    resourcesRead: [...progress.resourcesRead, resourceId],
  };
  return grantNewAchievements(next).progress;
}

export function recordReview(progress: Progress, now = new Date()): Progress {
  let next: Progress = { ...bumpStreak(progress, todayStamp(now)), reviewCount: progress.reviewCount + 1 };
  return grantNewAchievements(next).progress;
}

export function recordCoach(progress: Progress, now = new Date()): Progress {
  let next: Progress = {
    ...bumpStreak(progress, todayStamp(now)),
    coachSessions: (progress.coachSessions ?? 0) + 1,
  };
  return grantNewAchievements(next).progress;
}

export type QuestKind = "solve" | "study" | "review" | "resource";

export interface DailyQuest {
  id: string;
  kind: QuestKind;
  title: string;
  detail: string;
  xp: number;
  href: string;
}

function hashDay(stamp: string): number {
  let h = 2166136261;
  for (let i = 0; i < stamp.length; i++) {
    h ^= stamp.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailyQuests(progress: Progress, today = todayStamp()): DailyQuest[] {
  const seed = hashDay(today);
  const unsolved = PROBLEMS.filter((p) => !progress.solved[p.id]);
  const pick = unsolved.length ? unsolved[seed % unsolved.length] : PROBLEMS[seed % PROBLEMS.length];
  const unstudied = PATTERNS.filter((p) => !progress.studied[p.id]);
  const pattern = unstudied.length ? unstudied[seed % unstudied.length] : PATTERNS[seed % PATTERNS.length];
  const solvedIds = Object.keys(progress.solved);
  const reviewId = solvedIds.length ? solvedIds[seed % solvedIds.length] : pick.id;
  const reviewProblem = PROBLEMS.find((p) => p.id === reviewId) ?? pick;

  return [
    {
      id: `solve-${today}`,
      kind: "solve",
      title: `Solve ${pick.title}`,
      detail: `${pick.difficulty} · ${pick.pattern.replace("-", " ")} · ${pick.xp} XP`,
      xp: 30,
      href: `/practice/${pick.id}`,
    },
    {
      id: `study-${today}`,
      kind: "study",
      title: `Study ${pattern.name}`,
      detail: `${pattern.studyMinutes} min · +${pattern.xp} XP when marked studied`,
      xp: 20,
      href: `/learn/${pattern.id}`,
    },
    {
      id: `review-${today}`,
      kind: "review",
      title: solvedIds.length ? `Re-solve ${reviewProblem.title} from memory` : "Solve your first problem, then review tomorrow",
      detail: "Spaced repetition — close the editor, redraw the approach, then code it again.",
      xp: 25,
      href: `/practice/${reviewProblem.id}`,
    },
  ];
}

export function recommendedProblem(progress: Progress): Problem {
  const mastery = patternMastery(progress);
  const weakest = [...PATTERNS].sort((a, b) => {
    const ma = mastery[a.id];
    const mb = mastery[b.id];
    const ra = ma.total ? ma.solved / ma.total : 1;
    const rb = mb.total ? mb.solved / mb.total : 1;
    return ra - rb;
  })[0];
  const candidate =
    PROBLEMS.find((p) => !progress.solved[p.id] && p.pattern === weakest.id) ??
    PROBLEMS.find((p) => !progress.solved[p.id] && p.difficulty === "easy") ??
    PROBLEMS.find((p) => !progress.solved[p.id]) ??
    PROBLEMS[0];
  return candidate;
}

export function completeQuest(progress: Progress, questId: string, today = todayStamp()): Progress {
  const done = new Set(progress.questLog[today] ?? []);
  if (done.has(questId)) return progress;
  const quests = dailyQuests(progress, today);
  const quest = quests.find((q) => q.id === questId);
  let next: Progress = {
    ...bumpStreak(progress, today),
    questLog: { ...progress.questLog, [today]: [...Array.from(done), questId] },
    xp: progress.xp + (quest?.xp ?? 0),
  };
  if (quest?.kind === "review") next = { ...next, reviewCount: next.reviewCount + 1 };
  return grantNewAchievements(next).progress;
}

export function isQuestDone(progress: Progress, questId: string, today = todayStamp()): boolean {
  return Boolean(progress.questLog[today]?.includes(questId));
}
