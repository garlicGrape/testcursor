import { parseHarnessOutput, wrapUserCode } from "./harness";
import type { TestResult } from "./harness";

export type RunOutcome = {
  results: TestResult[];
  stdout: string;
  error?: string;
};

type WorkerResponse = {
  id: number;
  ok: boolean;
  output?: string;
  error?: string;
};

const DEFAULT_TIMEOUT_MS = 20000;
const WARMUP_TIMEOUT_MS = 60000;

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  number,
  { resolve: (value: RunOutcome) => void; timer: ReturnType<typeof setTimeout> }
>();

function workerUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}/pyodide-worker.js`;
}

function attachWorker(w: Worker) {
  w.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const job = pending.get(event.data.id);
    if (!job) return;
    pending.delete(event.data.id);
    clearTimeout(job.timer);
    if (!event.data.ok) {
      job.resolve({ results: [], stdout: event.data.output ?? "", error: event.data.error || "Python error" });
      return;
    }
    const stdout = event.data.output ?? "";
    try {
      job.resolve({ results: parseHarnessOutput(stdout), stdout });
    } catch {
      job.resolve({ results: [], stdout, error: "Could not parse test results" });
    }
  };
  w.onerror = () => {
    // Individual timeouts still fire; a hard worker crash should fail open jobs.
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
    job.resolve({ results: [], stdout: "", error: reason });
  }
}

export function warmPyodide(): Promise<RunOutcome> {
  return runUserCode("pass", "", WARMUP_TIMEOUT_MS);
}

export function runUserCode(
  userCode: string,
  tests: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<RunOutcome> {
  const code = wrapUserCode(userCode, tests);
  const id = ++seq;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      killWorker("Timed out — infinite loop or the Python runtime is still downloading. Try Run again.");
      resolve({
        results: [],
        stdout: "",
        error: "Timed out — infinite loop or the Python runtime is still downloading. Try Run again.",
      });
    }, timeoutMs);
    pending.set(id, { resolve, timer });
    try {
      getWorker().postMessage({ id, code });
    } catch (err) {
      pending.delete(id);
      clearTimeout(timer);
      resolve({ results: [], stdout: "", error: err instanceof Error ? err.message : String(err) });
    }
  });
}
