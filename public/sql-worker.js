/* global initSqlJs */
let sqlPromise = null;

function getSQL() {
  if (!sqlPromise) {
    importScripts("https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/sql-wasm.js");
    sqlPromise = initSqlJs({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/${file}`,
    });
  }
  return sqlPromise;
}

self.onmessage = async (event) => {
  const { id, setup, query } = event.data || {};
  if (id == null) return;
  try {
    const SQL = await getSQL();
    const db = new SQL.Database();
    if (setup) db.run(setup);
    const tables = query && String(query).trim() ? db.exec(query) : [];
    db.close();
    self.postMessage({
      id,
      ok: true,
      tables: tables.map((t) => ({ columns: t.columns, values: t.values })),
    });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    self.postMessage({ id, ok: false, error: message, tables: [] });
  }
};
