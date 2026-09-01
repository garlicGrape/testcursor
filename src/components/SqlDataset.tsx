import { DataTable } from "./DataTable";
import type { SqlSpec } from "@/lib/sqlHarness";
import { parseSqlSetup, stringifyCell, toTableView } from "@/lib/sqlPreview";

export function SqlDataset({ spec, tone = "dark", defaultOpen = true }: { spec: SqlSpec; tone?: "dark" | "light"; defaultOpen?: boolean }) {
  const first = spec.cases[0];
  if (!first) return null;
  const tables = parseSqlSetup(first.setup);
  const expected = toTableView(first.expected.columns, first.expected.rows);
  const hidden = spec.cases.length - 1;
  const light = tone === "light";

  return (
    <details
      open={defaultOpen}
      className={
        light
          ? "rounded-xl border border-ink-950/10 bg-ink-950/[0.03] p-3"
          : "rounded-xl border border-violet-500/20 bg-ink-950/40 p-3"
      }
    >
      <summary className={`cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] ${light ? "text-violet-800" : "text-gold-400"}`}>
        Dataset · {tables.map((t) => t.name).join(", ") || "tables"} · return {expected.columns.join(", ")}
      </summary>
      <p className={`mt-2 text-sm ${light ? "text-ink-950/70" : "text-paper/60"}`}>
        Your query runs against these tables. Match the <span className="font-medium">Return</span> columns (names can
        differ by case). Row order {first.orderMatters ? "matters" : "does not matter"} unless the prompt says to sort.
        {hidden > 0 ? ` Submit also runs ${hidden} extra hidden check${hidden === 1 ? "" : "s"}.` : ""}
      </p>
      <div className="mt-3 space-y-4">
        {tables.map((table) => (
          <DataTable
            key={table.name}
            tone={tone}
            caption={`${table.name}  (${table.columns.map((c) => `${c.name} ${c.type}`).join(", ")})`}
            columns={table.columns.map((c) => c.name)}
            rows={table.rows.map((row) => row.map((cell) => stringifyCell(cell)))}
          />
        ))}
        <DataTable tone={tone} caption="Return this" columns={expected.columns} rows={expected.rows} />
      </div>
    </details>
  );
}
