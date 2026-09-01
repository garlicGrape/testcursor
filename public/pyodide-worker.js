/* global loadPyodide */
let pyodidePromise = null;

self.onmessage = async (event) => {
  const { id, code } = event.data || {};
  if (id == null) return;
  try {
    if (!pyodidePromise) {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
      pyodidePromise = loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });
    }
    const pyodide = await pyodidePromise;
    const chunks = [];
    pyodide.setStdout({ batched: (s) => chunks.push(s) });
    pyodide.setStderr({ batched: (s) => chunks.push(s) });
    await pyodide.runPythonAsync(code);
    self.postMessage({ id, ok: true, output: chunks.join("") });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    self.postMessage({ id, ok: false, error: message, output: "" });
  }
};
