import * as esbuild from "esbuild-wasm";

let initialized = false;

export async function getEsbuild(): Promise<typeof esbuild> {
  if (!initialized) {
    await esbuild.initialize({
      wasmURL: "./esbuild.wasm",
      worker: false,
    });
    initialized = true;
    console.log("esbuild initialized");
  }
  return esbuild;
}
