import * as esbuild from "esbuild-wasm";

let initialized = false;
let initializing: Promise<void> | null = null;

export async function getEsbuild(): Promise<typeof esbuild> {
  if (initialized) return esbuild;
  if (initializing) {
    await initializing;
    return esbuild;
  }

  const wasmURL = (() => {
    try {
      const origin = typeof location !== "undefined" ? location.origin : "";
      return new URL("esbuild.wasm", (origin || "/") + "/").toString();
    } catch {
      return "./esbuild.wasm";
    }
  })();

  initializing = (async () => {
    try {
      await esbuild.initialize({ wasmURL, worker: false });
      console.log("esbuild initialized");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Ignore double-init errors caused by HMR/strict effects or races
      if (!/initialize\b.*more than once/i.test(msg)) {
        throw e;
      }
    } finally {
      initialized = true;
      initializing = null;
    }
  })();

  await initializing;
  return esbuild;
}
