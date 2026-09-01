import type { SqlCase } from "./sqlHarness";
import { compareTables, resultFromExec, toTestResult } from "./sqlHarness";
import type { TestResult } from "./harness";

export type SqlRunOutcome = {
  results: TestResult[];
  error?: string;
};

type WorkerResponse = {
  id: number;
  ok: boolean;
  tables?: { columns: string[]; values: unknown[][] }[];
  error?: string;
};

const DEFAULT_TIMEOUT_MS = 20000;
const WARMUP_TIMEOUT_MS = 60000;

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  number,
  { resolve: (value: { tables: { columns: string[]; values: unknown[][] }[]; error?: string }) => void; timer: ReturnType<typeof setTimeout> }
>();

function workerUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/sql-worker.js`;
}

function attachWorker(w: Worker) {
  w.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const job = pending.get(event.data.id);
    if (!job) return;
    pending.delete(event.data.id);
    clearTimeout(job.timer);
    if (!event.data.ok) {
      job.resolve({ tables: [], error: event.data.error || "SQL error" });
      return;
    }
    job.resolve({ tables: event.data.tables ?? [] });
  };
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(workerUrl());
    attachWorker(worker);
  }
  return worker;
}

function killWorker(reason: string) {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const [id, job] of pending) {
    pending.delete(id);
    clearTimeout(job.timer);
    job.resolve({ tables: [], error: reason });
  }
}

function execOnce(setup: string, query: string, timeoutMs: number) {
  const id = ++seq;
  return new Promise<{ tables: { columns: string[]; values: unknown[][] }[]; error?: string }>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      killWorker("Timed out — SQL runtime still downloading or the query looped. Try Run again.");
      resolve({ tables: [], error: "Timed out — SQL runtime still downloading or the query looped. Try Run again." });
    }, timeoutMs);
    pending.set(id, { resolve, timer });
    try {
      getWorker().postMessage({ id, setup, query });
    } catch (err) {
      pending.delete(id);
      clearTimeout(timer);
      resolve({ tables: [], error: err instanceof Error ? err.message : String(err) });
    }
  });
}

export function warmSql(): Promise<SqlRunOutcome> {
  return execOnce("SELECT 1 AS ok;", "SELECT 1 AS ok;", WARMUP_TIMEOUT_MS).then((r) => ({
    results: [],
    error: r.error,
  }));
}

export async function runSqlCases(query: string, cases: SqlCase[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<SqlRunOutcome> {
  const results: TestResult[] = [];
  for (const c of cases) {
    const raw = await execOnce(c.setup, query, timeoutMs);
    if (raw.error) {
      results.push({ name: c.name, ok: false, got: raw.error, want: "a valid SELECT" });
      continue;
    }
    const got = resultFromExec(raw.tables);
    const cmp = compareTables(got, c.expected, Boolean(c.orderMatters));
    results.push(toTestResult(c.name, cmp));
  }
  return { results };
}
