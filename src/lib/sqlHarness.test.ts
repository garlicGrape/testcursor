import { describe, expect, it } from "vitest";
import { compareTables } from "./sqlHarness";

describe("sql result compare", () => {
  it("treats row order as irrelevant by default", () => {
    const cmp = compareTables(
      { columns: ["name", "id"], rows: [["b", 2], ["a", 1]] },
      { columns: ["NAME", "ID"], rows: [["a", 1], ["b", 2]] },
      false,
    );
    expect(cmp.ok).toBe(true);
  });

  it("maps NULL cells", () => {
    const cmp = compareTables(
      { columns: ["x"], rows: [[null]] },
      { columns: ["x"], rows: [[undefined]] },
      false,
    );
    expect(cmp.ok).toBe(true);
  });

  it("fails on extra rows", () => {
    const cmp = compareTables(
      { columns: ["id"], rows: [[1], [2]] },
      { columns: ["id"], rows: [[1]] },
      false,
    );
    expect(cmp.ok).toBe(false);
  });
});
