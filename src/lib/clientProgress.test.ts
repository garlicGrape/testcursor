import { describe, expect, it } from "vitest";
import { applyProgressAction } from "./clientProgress";
import { emptyProgress } from "./game";

describe("applyProgressAction", () => {
  it("records a first solve without a server", () => {
    const { progress, extra } = applyProgressAction(emptyProgress(), {
      action: "solve",
      problemId: "pair-sum",
      hintsUsed: 0,
    });
    expect(extra.firstSolve).toBe(true);
    expect(progress.solved["pair-sum"]).toBeTruthy();
    expect(progress.xp).toBeGreaterThan(0);
  });

  it("rejects unknown problems", () => {
    const { extra } = applyProgressAction(emptyProgress(), {
      action: "solve",
      problemId: "not-a-real-id",
    });
    expect(extra.error).toBe("unknown problem");
  });
});
