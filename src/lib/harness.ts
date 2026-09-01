export interface TestResult {
  name: string;
  ok: boolean;
  got: string;
  want: string;
}

export interface CodingSpec {
  starter: string;
  tests: string;
}

export const HARNESS_HEAD = `
import json
RESULTS = []

def check(name, got, want):
    RESULTS.append({
        "name": str(name),
        "ok": got == want,
        "got": repr(got),
        "want": repr(want),
    })
`;

export const HARNESS_TAIL = `
print("___DOJO_RESULTS___")
print(json.dumps(RESULTS))
`;

export function wrapUserCode(userCode: string, tests: string): string {
  return `${userCode}\n${HARNESS_HEAD}\n${tests}\n${HARNESS_TAIL}`;
}

export function parseHarnessOutput(output: string): TestResult[] {
  const marker = "___DOJO_RESULTS___";
  const idx = output.lastIndexOf(marker);
  if (idx === -1) return [];
  const after = output.slice(idx + marker.length).trim();
  const jsonText = after.split("\n").filter((line) => line.trim().length > 0).pop() ?? "[]";
  return JSON.parse(jsonText) as TestResult[];
}

export function casesToTests(
  cases: { name: string; got: string; want: string }[],
  preamble = "",
): string {
  const body = cases
    .map((c) => {
      const n = JSON.stringify(c.name);
      return `try:
    check(${n}, ${c.got}, ${c.want})
except Exception as _e:
    RESULTS.append({"name": ${n}, "ok": False, "got": type(_e).__name__ + ": " + str(_e), "want": ${JSON.stringify(c.want)}})
`;
    })
    .join("\n");
  return preamble ? `${preamble}\n${body}` : body;
}
