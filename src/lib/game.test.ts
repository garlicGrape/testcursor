import { describe, expect, it } from "vitest";
import { PROBLEMS } from "../data/problems";
import { ACHIEVEMENTS, XP_PER_LEVEL } from "../data/types";
import {
  bumpStreak,
  completeQuest,
  dailyQuests,
  emptyProgress,
  hintMultiplier,
  isQuestDone,
  levelFromXp,
  nextProblem,
  pickDailyTargets,
  rankForLevel,
  recordSolve,
  recordStudy,
  reviewSchedule,
  withDailyPin,
  xpForSolve,
} from "./game";

describe("level and rank", () => {
  it("starts at level 1 Applicant", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(rankForLevel(1).title).toBe("Applicant");
  });

  it("promotes at XP_PER_LEVEL boundaries", () => {
    expect(levelFromXp(XP_PER_LEVEL)).toBe(2);
    expect(levelFromXp(XP_PER_LEVEL * 9)).toBe(10);
    expect(rankForLevel(6).title).toBe("Phone Screen");
    expect(rankForLevel(10).title).toBe("Onsite");
  });
});

describe("xp for solves", () => {
  const medium = PROBLEMS.find((p) => p.id === "island-count")!;
  it("pays full XP with no hints", () => {
    expect(xpForSolve(medium, 0, false)).toBe(200);
  });
  it("penalizes hints and solution peeks", () => {
    expect(hintMultiplier(1, false)).toBe(0.85);
    expect(xpForSolve(medium, 3, false)).toBe(100);
    expect(xpForSolve(medium, 0, true)).toBe(50);
  });
});

describe("streak", () => {
  it("resets after a missed day", () => {
    const p = bumpStreak({ ...emptyProgress(), streak: 4, lastActiveDate: "2026-08-20" }, "2026-08-22");
    expect(p.streak).toBe(1);
  });
  it("increments consecutive days", () => {
    const p = bumpStreak({ ...emptyProgress(), streak: 2, lastActiveDate: "2026-08-21" }, "2026-08-22");
    expect(p.streak).toBe(3);
  });
});

describe("recordSolve", () => {
  it("awards first-solve XP and First Blood", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const { progress, xpEarned, firstSolve, newly } = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    expect(firstSolve).toBe(true);
    expect(xpEarned).toBe(100);
    expect(progress.solved["pair-sum"].localPass).toBe(true);
    expect(newly).toContain("first-blood");
    expect(progress.xp).toBeGreaterThanOrEqual(100 + (ACHIEVEMENTS.find((a) => a.id === "first-blood")?.xp ?? 0));
  });

  it("does not double-pay a second solve", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const first = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    const second = recordSolve(first.progress, problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T16:00:00Z"),
    });
    expect(second.xpEarned).toBe(0);
    expect(second.firstSolve).toBe(false);
  });
});

describe("daily quests", () => {
  it("returns four stable quests for a given day including a SQL drill", () => {
    const pinned = withDailyPin(emptyProgress(), "2026-08-22");
    const a = dailyQuests(pinned, "2026-08-22");
    const b = dailyQuests(pinned, "2026-08-22");
    expect(a).toHaveLength(4);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a.some((q) => q.id.startsWith("sql-"))).toBe(true);
    expect(a.find((q) => q.id.startsWith("sql-"))?.href).toMatch(/\/practice\/sql-/);
  });

  it("does not pay quest XP from a Claim with no work", () => {
    const pinned = withDailyPin(emptyProgress(), "2026-08-22");
    const quest = dailyQuests(pinned, "2026-08-22")[0];
    const next = completeQuest(pinned, quest.id, "2026-08-22");
    expect(next.xp).toBe(0);
    expect(isQuestDone(next, quest.id, "2026-08-22")).toBe(false);
  });

  it("pays the solve quest only after a passing submit", () => {
    const today = "2026-08-22";
    const pinned = withDailyPin(emptyProgress(), today);
    const quest = dailyQuests(pinned, today).find((q) => q.id === `solve-${today}`)!;
    const problem = PROBLEMS.find((p) => p.id === quest.targetId)!;
    const failed = recordSolve(pinned, problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: false,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    expect(isQuestDone(failed.progress, quest.id, today)).toBe(false);
    const passed = recordSolve(pinned, problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    expect(isQuestDone(passed.progress, quest.id, today)).toBe(true);
    expect(passed.claimedQuests.some((q) => q.id === quest.id)).toBe(true);
    expect(passed.progress.xp).toBeGreaterThan(problem.xp);
  });

  it("suggests another unsolved problem of the same kind", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const { progress } = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    const nxt = nextProblem(progress, "pair-sum");
    expect(nxt.id).not.toBe("pair-sum");
    expect(progress.solved[nxt.id]?.localPass).not.toBe(true);
  });
});

describe("study and review cadence", () => {
  it("does not bump streak when a pattern is already studied", () => {
    const first = recordStudy(emptyProgress(), "hashing", new Date("2026-08-22T15:00:00Z"));
    const second = recordStudy(
      { ...first, lastActiveDate: "2026-08-20", streak: 5 },
      "hashing",
      new Date("2026-08-22T15:00:00Z"),
    );
    expect(second.streak).toBe(5);
    expect(second.lastActiveDate).toBe("2026-08-20");
    expect(second.xp).toBe(first.xp);
  });

  it("keeps a fresh easy pass off the due list until the interval elapses", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const { progress } = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    expect(reviewSchedule(progress, "2026-08-22").due).toHaveLength(0);
    expect(reviewSchedule(progress, "2026-08-25").due.map((item) => item.problem.id)).toContain("pair-sum");
  });

  it("puts an external log without a pass in unfinished immediately", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const { progress } = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: false,
      now: new Date("2026-08-22T15:00:00Z"),
    });
    expect(reviewSchedule(progress, "2026-08-22").unfinished.map((item) => item.problem.id)).toContain("pair-sum");
    expect(reviewSchedule(progress, "2026-08-22").due).toHaveLength(0);
  });

  it("pins the daily review quest to an overdue solve when one exists", () => {
    const problem = PROBLEMS.find((p) => p.id === "pair-sum")!;
    const { progress } = recordSolve(emptyProgress(), problem, {
      hintsUsed: 0,
      peekedSolution: false,
      localPass: true,
      now: new Date("2026-08-01T15:00:00Z"),
    });
    const pin = pickDailyTargets(progress, "2026-08-22");
    expect(pin.review).toBe("pair-sum");
  });
});

describe("user interview sheet", () => {
  it("adds 19 unique problems from the photo list", () => {
    const sheet = PROBLEMS.filter((p) => p.fromUserList);
    expect(sheet).toHaveLength(19);
    const ids = PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(sheet.map((p) => p.title)).toEqual(
      expect.arrayContaining([
        "Implement Time Counters",
        "Bishop",
        "Creating a maze",
        "Letter Dice",
        "Closest C numbers in a BST",
        "Majority Value",
        "Abbreviations",
        "Merge",
        "RateLimiter",
        "Pots of gold",
        "Friend suggest",
        "StockMarket 2 transactions",
        "Bounded sort",
        "Encoding using RLE",
        "Partition into palindromes",
        "Find all words in a string. Then do it on a Google scale.",
        "Minimizing work days",
        "Print all rotationally symmetric numbers less than N",
        "Number of no contiguous substring matches",
      ]),
    );
  });

  it("ships a large python catalog plus a SQL interview track", () => {
    const sql = PROBLEMS.filter((p) => p.kind === "sql");
    const python = PROBLEMS.filter((p) => (p.kind ?? "python") === "python");
    expect(python.length).toBeGreaterThanOrEqual(70);
    expect(sql.length).toBeGreaterThanOrEqual(24);
  });
});
