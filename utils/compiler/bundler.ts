import * as esbuild from "esbuild-wasm";
import { isEsbuildReady } from "./esbuild";

export async function bundleFiles(
  files: Map<string, string>,
  entryPoint: string
): Promise<string> {
  if (!isEsbuildReady()) {
    throw new Error(
      "Hold up! esbuild isn't initialized yet. Call initializeEsbuild() first."
    );
  }

  // Create a virtual filesystem plugin for esbuild.
  // This lets us bundle files that only exist in memory.
  const virtualFsPlugin: esbuild.Plugin = {
    name: "virtual-fs",
    setup(build) {
      // Handle React imports specially - we mark them as external
      // because we'll provide React as a global at runtime.
      build.onResolve({ filter: /^react(-dom)?$/ }, (args) => {
        return {
          path: args.path,
          namespace: "react-external",
        };
      });

      // For React externals, return a shim that uses the global
      build.onLoad({ filter: /.*/, namespace: "react-external" }, (args) => {
        if (args.path === "react") {
          return {
            contents: "module.exports = React;",
            loader: "js",
          };
        }
        if (args.path === "react-dom") {
          return {
            contents: "module.exports = ReactDOM;",
            loader: "js",
          };
        }
        return null;
      });

      // Handle relative imports (./something or ../something)
      // We need to resolve these to actual file paths in our virtual FS
      build.onResolve({ filter: /^\./ }, (args) => {
        // Figure out the directory of the file doing the import
        const importerDir = args.importer
          ? args.importer.substring(0, args.importer.lastIndexOf("/"))
          : "";

        const resolved = resolvePath(importerDir, args.path);

        // Try finding the file with different extensions
        // (user might import "./Button" but the file is "Button.tsx")
        const extensions = ["", ".tsx", ".ts", ".jsx", ".js"];
        for (const ext of extensions) {
          const tryPath = resolved + ext;
          if (files.has(tryPath)) {
            return { path: tryPath, namespace: "virtual" };
          }
        }

        // Maybe it's a directory with an index file?
        for (const ext of extensions) {
          const tryPath = resolved + "/index" + ext;
          if (files.has(tryPath)) {
            return { path: tryPath, namespace: "virtual" };
          }
        }

        // Couldn't find it, but let esbuild try anyway
        return { path: resolved, namespace: "virtual" };
      });

      // Load files from our virtual filesystem
      build.onLoad({ filter: /.*/, namespace: "virtual" }, (args) => {
        const content = files.get(args.path);

        if (content === undefined) {
          return {
            errors: [
              {
                text: `File not found: ${args.path}. Check that the import path is correct.`,
              },
            ],
          };
        }

        // Pick the right loader based on file extension
        const ext = args.path.split(".").pop() || "";
        const loaderMap: Record<string, esbuild.Loader> = {
          tsx: "tsx",
          ts: "ts",
          jsx: "jsx",
          js: "js",
        };
        const loader = loaderMap[ext] || "js";

        return { contents: content, loader };
      });

      // The entry point also needs to go through our virtual filesystem
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === "entry-point") {
          return { path: args.path, namespace: "virtual" };
        }
        return null;
      });
    },
  };

  // Now run the actual build
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false, // Don't write to disk, give us the output
    format: "iife", // Wrap in an immediately-invoked function
    globalName: "__AppModule", // Export to this global variable
    plugins: [virtualFsPlugin],
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    target: "es2020",
    minify: false, // Keep it readable for debugging
  });

  if (result.errors.length > 0) {
    const errorMessages = result.errors.map((e) => e.text).join("\n");
    throw new Error(`Bundle failed:\n${errorMessages}`);
  }

  let output = result.outputFiles?.[0]?.text || "";

  // esbuild uses arrow function IIFE syntax, but older browsers
  // might not support it. Convert to regular function syntax.
  output = output.replace(
    /var __AppModule\s*=\s*\(\(\)\s*=>\s*\{/,
    "var __AppModule = (function() {"
  );

  return output;
}

function resolvePath(base: string, relative: string): string {
  const baseParts = base.split("/").filter(Boolean);
  const relativeParts = relative.split("/");

  for (const part of relativeParts) {
    if (part === "..") {
      baseParts.pop();
    } else if (part !== ".") {
      baseParts.push(part);
    }
  }

  return "/" + baseParts.join("/");
}

export function extractComponentFromBundle(bundleCode: string): {
  code: string;
  componentName: string;
} {
  // The bundle exports via __AppModule.default (ES module style)
  // We need to detect what the default export is called
  const defaultExportMatch = bundleCode.match(/["']?default["']?\s*:\s*(\w+)/);
  const componentName = defaultExportMatch ? defaultExportMatch[1] : "App";

  // Generate code that extracts the component for use
  const code = `
    ${bundleCode}
    var ${componentName} = __AppModule && __AppModule.default ? __AppModule.default : __AppModule;
  `;

  return { code, componentName };
}
