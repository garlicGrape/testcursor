import type { ResultTable, TestResult } from "./harness";
import { stringifyCell } from "./sqlPreview";

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

export function compareTables(
  got: SqlTable,
  want: SqlTable,
  orderMatters: boolean,
): { ok: boolean; got: string; want: string; gotTable: ResultTable; wantTable: ResultTable } {
  const a = normalizeTable(got, orderMatters);
  const b = normalizeTable(want, orderMatters);
  const ok = JSON.stringify(a) === JSON.stringify(b);
  const gotTable = { columns: got.columns, rows: got.rows.map((row) => row.map((cell) => stringifyCell(cell))) };
  const wantTable = { columns: want.columns, rows: want.rows.map((row) => row.map((cell) => stringifyCell(cell))) };
  return { ok, got: formatTable(a), want: formatTable(b), gotTable, wantTable };
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

export function toTestResult(
  name: string,
  cmp: { ok: boolean; got: string; want: string; gotTable?: ResultTable; wantTable?: ResultTable },
): TestResult {
  return {
    name,
    ok: cmp.ok,
    got: cmp.got,
    want: cmp.want,
    gotTable: cmp.gotTable,
    wantTable: cmp.wantTable,
  };
}
