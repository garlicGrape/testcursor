export interface PreviewColumn {
  name: string;
  type: string;
}

export interface PreviewTable {
  name: string;
  columns: PreviewColumn[];
  rows: unknown[][];
}

export interface SqlTableView {
  columns: string[];
  rows: string[][];
}

/** Parse CREATE TABLE + INSERT FROM our own spec setups (not general SQL). */
export function parseSqlSetup(setup: string): PreviewTable[] {
  const tables = new Map<string, PreviewTable>();
  const createRe = /CREATE TABLE\s+(\w+)\s*\(([^;]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = createRe.exec(setup))) {
    const name = m[1];
    const columns = m[2]
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const bits = part.split(/\s+/);
        return { name: bits[0], type: bits.slice(1).join(" ") || "ANY" };
      });
    tables.set(name.toLowerCase(), { name, columns, rows: [] });
  }

  const insertRe = /INSERT INTO\s+(\w+)\s+VALUES\s*([^;]+);/gi;
  while ((m = insertRe.exec(setup))) {
    const name = m[1];
    const key = name.toLowerCase();
    const rows = parseValueTuples(m[2]);
    const existing = tables.get(key);
    if (existing) {
      existing.rows.push(...rows);
    } else {
      const width = rows[0]?.length ?? 0;
      tables.set(key, {
        name,
        columns: Array.from({ length: width }, (_, i) => ({ name: `c${i + 1}`, type: "ANY" })),
        rows,
      });
    }
  }

  return Array.from(tables.values());
}

function parseValueTuples(sql: string): unknown[][] {
  const rows: unknown[][] = [];
  let i = 0;
  while (i < sql.length) {
    while (i < sql.length && /[\s,]/.test(sql[i])) i += 1;
    if (i >= sql.length) break;
    if (sql[i] !== "(") {
      i += 1;
      continue;
    }
    i += 1;
    const row: unknown[] = [];
    while (i < sql.length && sql[i] !== ")") {
      while (i < sql.length && /[\s,]/.test(sql[i])) i += 1;
      if (i >= sql.length || sql[i] === ")") break;
      const parsed = parseValue(sql, i);
      row.push(parsed.value);
      i = parsed.next;
    }
    if (sql[i] === ")") i += 1;
    rows.push(row);
  }
  return rows;
}

function parseValue(sql: string, start: number): { value: unknown; next: number } {
  const s = sql.slice(start);
  if (/^NULL\b/i.test(s)) return { value: null, next: start + 4 };
  if (s[0] === "'" || s[0] === '"') {
    const quote = s[0];
    let i = 1;
    let out = "";
    while (i < s.length) {
      if (s[i] === quote) {
        if (s[i + 1] === quote) {
          out += quote;
          i += 2;
          continue;
        }
        return { value: out, next: start + i + 1 };
      }
      out += s[i];
      i += 1;
    }
    return { value: out, next: start + i };
  }
  const num = /^-?\d+(?:\.\d+)?/.exec(s);
  if (num) {
    const n = Number(num[0]);
    return { value: n, next: start + num[0].length };
  }
  const ident = /^\w+/.exec(s);
  if (ident) return { value: ident[0], next: start + ident[0].length };
  return { value: s[0], next: start + 1 };
}

export function stringifyCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "NULL";
  if (typeof cell === "number" && Number.isFinite(cell)) {
    const rounded = Math.round(cell * 10000) / 10000;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }
  return String(cell);
}

export function toTableView(columns: string[], rows: unknown[][]): SqlTableView {
  return {
    columns,
    rows: rows.map((row) => row.map((cell) => stringifyCell(cell))),
  };
}

export function parsePipeTable(text: string): SqlTableView | null {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length === 0 || text.trim() === "(empty)") {
    return { columns: [], rows: [] };
  }
  if (!lines[0].includes("|") && lines.length === 1) return null;
  const columns = lines[0].split("|");
  const rows = lines.slice(1).map((line) => line.split("|"));
  return { columns, rows };
}

export function makeSqlStarter(tables: PreviewTable[], outColumns: string[]): string {
  const names = tables.map((t) => t.name);
  const from = names[0] ?? "t";
  const selectCols = (outColumns.length ? outColumns : ["*"]).map((c) => `  ${c}`).join(",\n");
  const extra = names.slice(1);
  const lines = [
    `-- Tables in this problem: ${names.join(", ") || "(none)"}`,
    `-- Return columns: ${outColumns.join(", ") || "*"}`,
    extra.length ? `-- Other tables: ${extra.join(", ")}` : null,
    "",
    "SELECT",
    selectCols,
    `FROM ${from}`,
    extra.length ? `-- JOIN ${extra.join(" / ")} ON ...` : null,
    "WHERE",
    "  TRUE; -- replace with your filter, or delete WHERE",
  ];
  return `${lines.filter((l) => l !== null).join("\n")}\n`;
}
