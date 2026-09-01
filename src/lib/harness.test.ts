import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/problems";
import { getCoding } from "@/data/codingSpecs";
import { parseHarnessOutput, wrapUserCode } from "@/lib/harness";

function runPython(source: string): string {
  return execFileSync("python3", ["-c", source], {
    encoding: "utf8",
    timeout: 15000,
    maxBuffer: 2 * 1024 * 1024,
  });
}

describe("in-browser coding catalog", () => {
  it("has a coding spec for every problem id", () => {
    const missing = PROBLEMS.filter((p) => !getCoding(p.id)).map((p) => p.id);
    expect(missing).toEqual([]);
  });

  it("starters and tests compile as Python", () => {
    for (const problem of PROBLEMS) {
      const spec = getCoding(problem.id);
      expect(spec, `missing coding spec for ${problem.id}`).toBeTruthy();
      const wrapped = wrapUserCode(spec!.starter, spec!.tests);
      execFileSync("python3", ["-c", "import sys; compile(sys.stdin.read(), '<dojo>', 'exec')"], {
        input: wrapped,
        timeout: 5000,
      });
    }
  });
});

describe("harness", () => {
  it("parses ___DOJO_RESULTS___ from noisy stdout", () => {
    const results = parseHarnessOutput('hello\n___DOJO_RESULTS___\n[{"name":"t","ok":true,"got":"1","want":"1"}]\n');
    expect(results).toEqual([{ name: "t", ok: true, got: "1", want: "1" }]);
  });

  it("accepts a real two_sum against pair-sum hidden tests", () => {
    const spec = getCoding("pair-sum")!;
    const user = `
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []
`;
    const stdout = runPython(wrapUserCode(user, spec.tests));
    const results = parseHarnessOutput(stdout);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it("fails pair-sum starter", () => {
    const spec = getCoding("pair-sum")!;
    const stdout = runPython(wrapUserCode(spec.starter, spec.tests));
    const results = parseHarnessOutput(stdout);
    expect(results.some((r) => !r.ok)).toBe(true);
  });

  it("accepts is_valid against bracket-stack tests", () => {
    const spec = getCoding("bracket-stack")!;
    const user = `
def is_valid(s):
    pairs = {')':'(', ']':'[', '}':'{'}
    st = []
    for ch in s:
        if ch in pairs:
            if not st or st[-1] != pairs[ch]:
                return False
            st.pop()
        else:
            st.append(ch)
    return not st
`;
    const results = parseHarnessOutput(runPython(wrapUserCode(user, spec.tests)));
    expect(results.every((r) => r.ok)).toBe(true);
  });
});
