import * as esbuild from "esbuild-wasm";

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeEsbuild(): Promise<void> {
  // Already done? Cool, nothing to do.
  if (initialized) {
    return;
  }

  // Already in progress? Wait for it to finish.
  if (initPromise) {
    await initPromise;
    return;
  }

  // Start initialization. We store the promise so parallel calls
  // will wait on the same initialization rather than starting new ones.
  initPromise = esbuild.initialize({
    wasmURL: "/esbuild.wasm",
  });

  await initPromise;
  initialized = true;
}

export function isEsbuildReady(): boolean {
  return initialized;
}

export async function transformCode(code: string): Promise<string> {
  if (!initialized) {
    throw new Error(
      "esbuild not initialized yet! Call initializeEsbuild() first and wait for it."
    );
  }

  const result = await esbuild.transform(code, {
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: "es2020",
    minify: true,
  });

  return result.code;
}

export function cleanTransformedCode(code: string): {
  code: string;
  componentName: string;
} {
  let cleanedCode = code;

  // Strip all import statements - we'll provide React as a global
  cleanedCode = cleanedCode.replace(
    /import\s+.*?from\s+['"].*?['"];?\s*\n?/g,
    ""
  );
  cleanedCode = cleanedCode.replace(/import\s+['"].*?['"];?\s*\n?/g, "");

  // Now we need to find and handle the default export.
  // React components can be exported in different ways:
  //   1. export default function MyComponent() { ... }
  //   2. function MyComponent() { ... } export default MyComponent;
  //   3. const MyComponent = () => { ... }; export default MyComponent;

  let componentName = "App"; // fallback name

  // Pattern 1: "export default function ComponentName"
  // This is the most common pattern for function components
  const funcExportMatch = cleanedCode.match(
    /export\s+default\s+function\s+(\w+)\s*\(/
  );

  if (funcExportMatch) {
    componentName = funcExportMatch[1];
    // Remove "export default" but keep the function declaration
    cleanedCode = cleanedCode.replace(
      /export\s+default\s+function\s+(\w+)/,
      "function $1"
    );
  } else {
    // Pattern 2 & 3: "export default SomeIdentifier"
    const identifierExportMatch = cleanedCode.match(
      /export\s+default\s+(\w+)\s*;?/
    );
    if (identifierExportMatch) {
      componentName = identifierExportMatch[1];
      // Just remove the export statement entirely
      cleanedCode = cleanedCode.replace(/export\s+default\s+\w+;?\s*\n?/g, "");
    }
  }

  // Clean up any remaining export statements
  // Named exports: export { foo, bar };
  cleanedCode = cleanedCode.replace(/export\s+\{[^}]*\};?\s*\n?/g, "");
  // Inline exports: export const/let/var/function/class
  cleanedCode = cleanedCode.replace(
    /export\s+(?:const|let|var|function|class)\s+/g,
    ""
  );

  return { code: cleanedCode, componentName };
}
