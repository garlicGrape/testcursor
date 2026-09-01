import { ACHIEVEMENTS, DIFFICULTY_XP, PATTERNS, RANKS, XP_PER_LEVEL } from "@/data/types";
import type { DailyPin, PatternId, Problem, Progress, Rank, SolveRecord } from "@/data/types";
import { PROBLEMS, PROBLEM_BY_ID } from "@/data/problems";

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
    daily: {},
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
): { progress: Progress; xpEarned: number; firstSolve: boolean; newly: string[]; claimedQuests: DailyQuest[] } {
  const today = todayStamp(opts.now);
  const firstSolve = !progress.solved[problem.id];
  let next = bumpStreak(progress, today);
  const xpEarned = firstSolve ? xpForSolve(problem, opts.hintsUsed, opts.peekedSolution) : 0;
  const record: SolveRecord = next.solved[problem.id]
    ? {
        ...next.solved[problem.id],
        attempts: next.solved[problem.id].attempts + 1,
        lastAttemptAt: today,
        localPass: next.solved[problem.id].localPass || opts.localPass,
      }
    : {
        solvedAt: today,
        lastAttemptAt: today,
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
  const withQuests = applyEarnedQuests(granted.progress, today);
  return { progress: withQuests.progress, xpEarned, firstSolve, newly: granted.newly, claimedQuests: withQuests.claimed };
}

export function recordStudy(progress: Progress, patternId: PatternId, now = new Date()): Progress {
  if (progress.studied[patternId]) return bumpStreak(progress, todayStamp(now));
  const guide = PATTERNS.find((p) => p.id === patternId);
  let next: Progress = {
    ...bumpStreak(progress, todayStamp(now)),
    xp: progress.xp + (guide?.xp ?? 40),
    studied: { ...progress.studied, [patternId]: todayStamp(now) },
  };
  const granted = grantNewAchievements(next);
  return applyEarnedQuests(granted.progress, todayStamp(now)).progress;
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

export type QuestKind = "solve" | "study" | "review";

export interface DailyQuest {
  id: string;
  kind: QuestKind;
  title: string;
  detail: string;
  xp: number;
  href: string;
  targetId: string;
  how: string;
}

function hashDay(stamp: string): number {
  let h = 2166136261;
  for (let i = 0; i < stamp.length; i++) {
    h ^= stamp.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickFrom<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

export function pickDailyTargets(progress: Progress, today = todayStamp()): DailyPin {
  const seed = hashDay(today);
  const python = PROBLEMS.filter((p) => (p.kind ?? "python") === "python");
  const sql = PROBLEMS.filter((p) => p.kind === "sql");
  const pythonOpen = python.filter((p) => !progress.solved[p.id]);
  const sqlOpen = sql.filter((p) => !progress.solved[p.id]);
  const unstudied = PATTERNS.filter((p) => !progress.studied[p.id]);
  const solvedIds = Object.keys(progress.solved);
  return {
    solve: pickFrom(pythonOpen.length ? pythonOpen : python, seed).id,
    sql: pickFrom(sqlOpen.length ? sqlOpen : sql, seed + 11).id,
    study: pickFrom(unstudied.length ? unstudied : PATTERNS, seed + 23).id,
    review: pickFrom(solvedIds.length ? solvedIds : python.map((p) => p.id), seed + 41),
  };
}

export function withDailyPin(progress: Progress, today = todayStamp()): Progress {
  if (progress.daily?.[today]) return progress;
  return {
    ...progress,
    daily: { ...(progress.daily ?? {}), [today]: pickDailyTargets(progress, today) },
  };
}

function pinFor(progress: Progress, today: string): DailyPin {
  return progress.daily?.[today] ?? pickDailyTargets(progress, today);
}

function didWorkToday(record: SolveRecord | undefined, today: string): boolean {
  if (!record?.localPass) return false;
  return record.lastAttemptAt === today || record.solvedAt === today;
}

export function isQuestSatisfied(progress: Progress, quest: DailyQuest, today = todayStamp()): boolean {
  if (quest.kind === "study") {
    return progress.studied[quest.targetId] === today;
  }
  return didWorkToday(progress.solved[quest.targetId], today);
}

export function dailyQuests(progress: Progress, today = todayStamp()): DailyQuest[] {
  const pin = pinFor(progress, today);
  const pick = PROBLEM_BY_ID[pin.solve] ?? PROBLEMS[0];
  const sqlPick = PROBLEM_BY_ID[pin.sql] ?? PROBLEMS.find((p) => p.kind === "sql") ?? PROBLEMS[0];
  const pattern = PATTERNS.find((p) => p.id === pin.study) ?? PATTERNS[0];
  const reviewProblem = PROBLEM_BY_ID[pin.review] ?? pick;
  const hasHistory = Boolean(progress.solved[pin.review]);

  return [
    {
      id: `solve-${today}`,
      kind: "solve",
      title: `Solve ${pick.title}`,
      detail: `${pick.difficulty} · ${pick.pattern.replace("-", " ")}`,
      xp: 30,
      href: `/practice/${pick.id}`,
      targetId: pick.id,
      how: "Pass hidden tests with Submit to earn the quest bonus.",
    },
    {
      id: `sql-${today}`,
      kind: "solve",
      title: `SQL: ${sqlPick.title}`,
      detail: `${sqlPick.difficulty} · ${sqlPick.pattern.replace("sql-", "sql ")}`,
      xp: 30,
      href: `/practice/${sqlPick.id}`,
      targetId: sqlPick.id,
      how: "Write the query, Run it, then Submit when the result table matches.",
    },
    {
      id: `study-${today}`,
      kind: "study",
      title: `Study ${pattern.name}`,
      detail: `${pattern.studyMinutes} min guide`,
      xp: 20,
      href: `/learn/${pattern.id}`,
      targetId: pattern.id,
      how: "Read the guide, then tap Mark studied on that page.",
    },
    {
      id: `review-${today}`,
      kind: "review",
      title: hasHistory ? `Re-solve ${reviewProblem.title} from memory` : `Solve ${reviewProblem.title} first, then review it`,
      detail: "Spaced repetition — redraw the approach, then Submit again.",
      xp: 25,
      href: `/practice/${reviewProblem.id}`,
      targetId: reviewProblem.id,
      how: "Submit a passing solution today (re-runs count).",
    },
  ];
}

export function applyEarnedQuests(
  progress: Progress,
  today = todayStamp(),
): { progress: Progress; claimed: DailyQuest[] } {
  const pinned = withDailyPin(progress, today);
  const claimed: DailyQuest[] = [];
  let next = pinned;
  for (const quest of dailyQuests(next, today)) {
    if (isQuestDone(next, quest.id, today)) continue;
    if (!isQuestSatisfied(next, quest, today)) continue;
    next = completeQuestUnchecked(next, quest, today);
    claimed.push(quest);
  }
  return { progress: next, claimed };
}

function completeQuestUnchecked(progress: Progress, quest: DailyQuest, today: string): Progress {
  const done = new Set(progress.questLog[today] ?? []);
  if (done.has(quest.id)) return progress;
  let next: Progress = {
    ...progress,
    questLog: { ...progress.questLog, [today]: [...Array.from(done), quest.id] },
    xp: progress.xp + quest.xp,
  };
  if (quest.kind === "review") next = { ...next, reviewCount: next.reviewCount + 1 };
  return grantNewAchievements(next).progress;
}

export function completeQuest(progress: Progress, questId: string, today = todayStamp()): Progress {
  const pinned = withDailyPin(progress, today);
  const quest = dailyQuests(pinned, today).find((q) => q.id === questId);
  if (!quest) return pinned;
  if (!isQuestSatisfied(pinned, quest, today)) return pinned;
  if (isQuestDone(pinned, quest.id, today)) return pinned;
  return completeQuestUnchecked(pinned, quest, today);
}

export function isQuestDone(progress: Progress, questId: string, today = todayStamp()): boolean {
  return Boolean(progress.questLog[today]?.includes(questId));
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
