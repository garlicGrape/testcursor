import type { TestResult } from "./harness";

export interface SqlTable {
  columns: string[];
  rows: unknown[][];
}

export interface SqlCase {
  name: string;
  setup: string;
  expected: SqlTable;
  orderMatters?: boolean;
}

export interface SqlSpec {
  starter: string;
  cases: SqlCase[];
}

export function normalizeTable(table: SqlTable, orderMatters: boolean): { columns: string[]; rows: string[][] } {
  const columns = table.columns.map((c) => c.toLowerCase());
  const rows = table.rows.map((row) => row.map((cell) => stringifyCell(cell)));
  if (!orderMatters) {
    rows.sort((a, b) => a.join("\0").localeCompare(b.join("\0")));
  }
  return { columns, rows };
}

function stringifyCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "NULL";
  if (typeof cell === "number" && Number.isFinite(cell)) {
    const rounded = Math.round(cell * 10000) / 10000;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }
  return String(cell);
}

export function compareTables(got: SqlTable, want: SqlTable, orderMatters: boolean): { ok: boolean; got: string; want: string } {
  const a = normalizeTable(got, orderMatters);
  const b = normalizeTable(want, orderMatters);
  const ok = JSON.stringify(a) === JSON.stringify(b);
  return { ok, got: formatTable(a), want: formatTable(b) };
}

function formatTable(t: { columns: string[]; rows: string[][] }): string {
  if (!t.columns.length && !t.rows.length) return "(empty)";
  return `${t.columns.join("|")}\n${t.rows.map((r) => r.join("|")).join("\n")}`;
}

export function emptyTable(): SqlTable {
  return { columns: [], rows: [] };
}

export function resultFromExec(tables: { columns: string[]; values: unknown[][] }[]): SqlTable {
  if (!tables.length) return emptyTable();
  const first = tables[0];
  return { columns: first.columns, rows: first.values };
}

export function toTestResult(name: string, cmp: { ok: boolean; got: string; want: string }): TestResult {
  return { name, ok: cmp.ok, got: cmp.got, want: cmp.want };
}
