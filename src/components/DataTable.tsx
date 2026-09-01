import type { ResultTable } from "@/lib/harness";
import { parsePipeTable } from "@/lib/sqlPreview";

function asView(table?: ResultTable, fallback?: string): ResultTable | null {
  if (table && (table.columns.length || table.rows.length)) return table;
  if (fallback) return parsePipeTable(fallback);
  return table ?? null;
}

export function DataTable({
  columns,
  rows,
  tone = "dark",
  caption,
  markExtra,
  empty = "No rows",
  maxRows = 16,
}: {
  columns: string[];
  rows: string[][];
  tone?: "dark" | "light";
  caption?: string;
  markExtra?: Set<string>;
  empty?: string;
  maxRows?: number;
}) {
  const shown = rows.slice(0, maxRows);
  const hidden = rows.length - shown.length;
  const light = tone === "light";
  const wrap = light
    ? "overflow-x-auto rounded-lg border border-ink-950/10 bg-white"
    : "overflow-x-auto rounded-lg border border-violet-500/20 bg-ink-950/50";
  const th = light
    ? "border-b border-ink-950/10 bg-ink-950/5 px-2 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide text-ink-950/70"
    : "border-b border-violet-500/20 bg-ink-900 px-2 py-1.5 text-left font-mono text-[11px] uppercase tracking-wide text-gold-400/90";
  const td = light
    ? "border-b border-ink-950/5 px-2 py-1 font-mono text-[12px] text-ink-950"
    : "border-b border-white/5 px-2 py-1 font-mono text-[12px] text-paper/90";

  return (
    <div>
      {caption && (
        <p className={`mb-1 font-mono text-[10px] uppercase tracking-[0.16em] ${light ? "text-violet-800" : "text-gold-400"}`}>
          {caption}
        </p>
      )}
      <div className={wrap}>
        {columns.length === 0 && rows.length === 0 ? (
          <p className={`px-3 py-2 font-mono text-xs ${light ? "text-ink-950/50" : "text-paper/45"}`}>{empty}</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c} className={`${th} ${markExtra?.has(c.toLowerCase()) ? "text-ember" : ""}`}>
                    {c}
                    {markExtra?.has(c.toLowerCase()) ? " · extra" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row, i) => (
                <tr key={`${i}-${row.join("|")}`}>
                  {columns.map((_, j) => (
                    <td key={j} className={td}>
                      {row[j] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {hidden > 0 && (
        <p className={`mt-1 font-mono text-[10px] ${light ? "text-ink-950/45" : "text-paper/40"}`}>+ {hidden} more rows</p>
      )}
    </div>
  );
}

export function RunCompare({ result }: { result: { ok: boolean; name: string; got: string; want: string; gotTable?: ResultTable; wantTable?: ResultTable } }) {
  const got = asView(result.gotTable, result.got);
  const want = asView(result.wantTable, result.want);
  const wantCols = new Set((want?.columns ?? []).map((c) => c.toLowerCase()));
  const extra = new Set((got?.columns ?? []).map((c) => c.toLowerCase()).filter((c) => wantCols.size > 0 && !wantCols.has(c)));

  const sqlShaped = Boolean(got || want);

  return (
    <li className={`rounded-lg px-3 py-2 ${result.ok ? "bg-gold-400/10" : "bg-ember/10"}`}>
      <p className={`font-mono text-[11px] ${result.ok ? "text-gold-200" : "text-ember"}`}>
        {result.ok ? "PASS" : "FAIL"} · {result.name}
      </p>
      {sqlShaped ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <DataTable
            columns={got?.columns ?? []}
            rows={got?.rows ?? []}
            caption="Your result"
            markExtra={extra}
            empty="Query returned no table (check SELECT / syntax)"
          />
          {!result.ok && (
            <DataTable columns={want?.columns ?? []} rows={want?.rows ?? []} caption="Expected" empty="(empty)" />
          )}
        </div>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ember">Your output</p>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md bg-ink-950/60 p-2 font-mono text-[12px] text-paper/90">
              {result.got}
            </pre>
          </div>
          {!result.ok && (
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gold-400">Expected</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md bg-ink-950/60 p-2 font-mono text-[12px] text-paper/90">
                {result.want}
              </pre>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
