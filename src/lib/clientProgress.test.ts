import { describe, expect, it } from "vitest";
import { applyProgressAction } from "./clientProgress";
import { emptyProgress } from "./game";

describe("applyProgressAction", () => {
  it("records a first solve without a server", () => {
    const { progress, extra } = applyProgressAction(emptyProgress(), {
      action: "solve",
      problemId: "pair-sum",
      hintsUsed: 0,
      localPass: true,
    });
    expect(extra.firstSolve).toBe(true);
    expect(progress.solved["pair-sum"]).toBeTruthy();
    expect(progress.xp).toBeGreaterThan(0);
  });

  it("gives no XP for an external log without passing tests", () => {
    const { progress, extra } = applyProgressAction(emptyProgress(), {
      action: "solve",
      problemId: "pair-sum",
      localPass: false,
    });
    expect(extra.firstSolve).toBe(true);
    expect(extra.xpEarned).toBe(0);
    expect(progress.xp).toBe(0);
    expect(progress.solved["pair-sum"].localPass).toBe(false);
  });

  it("does not pay streak or XP for a leftover review action", () => {
    const { progress, extra } = applyProgressAction(
      { ...emptyProgress(), streak: 4, lastActiveDate: "2026-08-20" },
      { action: "review" },
    );
    expect(extra.awarded).toBe(false);
    expect(progress.streak).toBe(4);
    expect(progress.xp).toBe(0);
    expect(progress.reviewCount).toBe(0);
  });

  it("rejects unknown problems", () => {
    const { extra } = applyProgressAction(emptyProgress(), {
      action: "solve",
      problemId: "not-a-real-id",
    });
    expect(extra.error).toBe("unknown problem");
  });
});
