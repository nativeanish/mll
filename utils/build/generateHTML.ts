import { useState } from "react";
import React from "react";
import ReactDOMServer from "react-dom/server";
import type { Plugin, PluginBuild, OnResolveArgs } from "esbuild-wasm";
import { getEsbuild } from "./esbuild";
// Keep these directives: we intentionally import the raw file contents via Vite's ?raw modifier.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite injects the string content for `../package.json?raw` at build time
import rootPkgJson from "../../package.json?raw";

export type DeliveryMode = "inline" | "network";

type ElementInput = {
  type: "element";
  // Ready-to-render React element used for server-side rendering (SSR)
  element: React.ReactElement;
  // Module id we expose virtually to the bundler for hydration (e.g. './Hero.tsx')
  moduleName: string;
  // Source code string for that virtual module
  moduleSource: string;
  // If the component is a named export, specify it (defaults to the default export)
  exportName?: string;
};

type ComponentInput<P = Record<string, unknown>> = {
  type: "component";
  // Component to SSR and then hydrate on the client
  component: React.ComponentType<P>;
  props?: P;
  // Virtual module wiring for the bundler
  moduleName: string; // e.g. './Hero.tsx'
  moduleSource: string; // raw source for the virtual module
  exportName?: string; // named export to import as Component; default is default export
};

export type GenerateHtmlInput = ElementInput | ComponentInput<unknown>;

export interface GenerateHtmlOptions {
  input: GenerateHtmlInput;
  deliveryMode: DeliveryMode;
  // Optional: force a dev build of CDN React (defaults to production/minified)
  dev?: boolean;
  // Optional full HTML template. Placeholders:
  //  - {{PRECONNECT}} injects a preconnect link (omitted for inline delivery)
  //  - {{STATIC_HTML}} SSR markup; wrapped in #root if the template doesn't include it
  //  - {{INLINE_MODULE_JS}} the bundled module JS (escaped for safe inlining)
  //  - {{INLINE_CSS}} if present, will receive the extracted Tailwind CSS
  htmlTemplate?: string;
  // External callbacks (optional)
  // Notify when generation starts (true) and ends (false)
  isGenerating?: (generating: boolean) => void;
  // Notify error or success once: { error: 1, data: message } on failure; { error: 0, data: null } on success
  isError?: (payload: { error: 0 | 1; data: string | null }) => void;
  // Optional additional virtual modules to provide to the bundler so relative imports don't hit the network
  // Keys should match the import specifiers used by your entry virtual module (e.g. './../Blocks/PageGeneration/Link.tsx')
  virtualModules?: Record<string, string>;
}

export type GenerateHtmlResult = {
  html: string; // final full HTML document
  previewHtml: string; // SSR-only inner HTML for preview
  bundledJs: string; // the client bundle (inlineable)
};
// Tailwind CSS via CDN (runtime engine). We skip CSS extraction and include this script tag in <head>.
const TAILWIND_CDN_TAG = '<script src="https://cdn.tailwindcss.com"></script>';

function getCdnReactVersion(): { version: string; dev: boolean } {
  const declared = JSON.parse(rootPkgJson) as {
    dependencies?: Record<string, string>;
  };
  const sanitize = (v?: string) =>
    (v || "")
      .trim()
      .replace(/^workspace:.*/, "")
      .replace(/^[^0-9]*/, "") // drop ^, ~, >= etc
      .replace(/\s+.*/, ""); // drop anything after a space
  const reactDeclared = sanitize(declared.dependencies?.react);
  const reactDomDeclared = sanitize(declared.dependencies?.["react-dom"]);
  const cdnVersion = reactDeclared || reactDomDeclared || "19.1.1";
  const dev = false;
  return { version: cdnVersion, dev };
}

function makeCdnMapper(version: string, dev: boolean) {
  // Map bare React imports to esm.sh URLs so the bundler can either fetch or leave them external
  return (spec: string) => {
    if (spec === "react")
      return `https://esm.sh/react@${version}${dev ? "?dev" : "?min"}`;
    if (spec === "react-dom")
      return `https://esm.sh/react-dom@${version}?deps=react@${version}${
        dev ? "&dev" : "&min"
      }`;
    if (spec === "react-dom/client")
      return `https://esm.sh/react-dom@${version}/client?deps=react@${version}${
        dev ? "&dev" : "&min"
      }`;
    if (spec === "react/jsx-runtime")
      return `https://esm.sh/react@${version}/jsx-runtime${
        dev ? "?dev" : "?min"
      }`;
    if (spec === "react/jsx-dev-runtime")
      return `https://esm.sh/react@${version}/jsx-dev-runtime${
        dev ? "?dev" : "?min"
      }`;
    return null;
  };
}

function makeHttpFetchPlugin(): Plugin {
  // Resolve and load http(s) imports by fetching their contents in the browser. Simple in-memory cache included.
  return {
    name: "http-fetch",
    setup(build: PluginBuild) {
      const cache = new Map<string, string>();
      build.onResolve({ filter: /^https?:\/\// }, (args: OnResolveArgs) => ({
        path: args.path,
        namespace: "http-url",
      }));
      build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => ({
        path: new URL(args.path, args.importer).toString(),
        namespace: "http-url",
      }));
      build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
        if (cache.has(args.path)) {
          return {
            contents: cache.get(args.path)!,
            loader: args.path.match(/\.(tsx|ts)$/) ? "tsx" : "js",
            resolveDir: new URL("./", args.path).toString(),
          };
        }
        const res = await fetch(args.path, { mode: "cors" });
        if (!res.ok)
          throw new Error(
            `Failed to fetch ${args.path}: ${res.status} ${res.statusText}`
          );
        const contents = await res.text();
        cache.set(args.path, contents);
        return {
          contents,
          loader: args.path.match(/\.(tsx|ts)$/) ? "tsx" : "js",
          resolveDir: new URL("./", res.url).toString(),
        };
      });
    },
  };
}

// (Old single-module virtual plugin removed in favor of the multi-module version below)
function makeVirtualModulePlugin(moduleMap: Record<string, string>): Plugin {
  // Provide one or more virtual modules (in-memory) so esbuild never tries to fetch TS/TSX files over HTTP in production.
  // Normalize all paths to POSIX-like specifiers without leading './' so matching is stable.
  const normalize = (p: string) => {
    const parts = p.replace(/\\/g, "/").split("/");
    const out: string[] = [];
    for (const part of parts) {
      if (!part || part === ".") continue;
      if (part === "..") out.pop();
      else out.push(part);
    }
    return out.join("/");
  };
  const dirname = (p: string) => {
    const s = normalize(p);
    const idx = s.lastIndexOf("/");
    return idx >= 0 ? s.slice(0, idx) : "";
  };
  const join = (a: string, b: string) => normalize((a ? a + "/" : "") + b);

  // Build a normalized map for lookups
  const vmap = new Map<string, string>();
  for (const [k, v] of Object.entries(moduleMap)) {
    vmap.set(normalize(k), v);
  }

  return {
    name: "virtual-component-module",
    setup(build: PluginBuild) {
      // 1) Resolve virtual modules and their relative imports
      build.onResolve({ filter: /.*/ }, (args) => {
        // Handle imports within the virtual namespace first
        if (args.namespace === "virtual-module") {
          if (/^\.?\.\//.test(args.path)) {
            const importerPath = args.importer.replace(/^virtual-module:/, "");
            const baseDir = dirname(importerPath);
            const resolved = join(baseDir, args.path);
            const candidates = [
              resolved,
              `${resolved}.tsx`,
              `${resolved}.ts`,
              `${resolved}.jsx`,
              `${resolved}.js`,
            ];
            for (const c of candidates) {
              const key = normalize(c);
              if (vmap.has(key)) {
                return { path: key, namespace: "virtual-module" };
              }
            }
          }
          // Let other resolvers try
          return undefined;
        }

        // Match entry/imports that refer to a provided virtual module exactly
        const key = normalize(args.path);
        if (vmap.has(key)) {
          return { path: key, namespace: "virtual-module" };
        }
        return undefined;
      });

      // 2) Serve module contents from the normalized map
      build.onLoad({ filter: /.*/, namespace: "virtual-module" }, (args) => {
        const source = vmap.get(args.path);
        if (typeof source !== "string") return null;
        const loader = args.path.endsWith(".tsx")
          ? "tsx"
          : args.path.endsWith(".ts")
            ? "ts"
            : args.path.endsWith(".jsx")
              ? "jsx"
              : "js";
        const baseDir = "/" + dirname(args.path);
        return { contents: source, loader, resolveDir: baseDir };
      });
    },
  };
}

export async function generateHtml(
  options: GenerateHtmlOptions
): Promise<GenerateHtmlResult> {
  // Render the component to HTML, extract just-in-time Tailwind CSS, then bundle a tiny hydrator.
  const {
    input,
    deliveryMode,
    isGenerating: onGenerating,
    isError: onError,
  } = options;
  onGenerating?.(true);
  try {
    // Establish the SSR element
    const element =
      input.type === "element"
        ? input.element
        : React.createElement(input.component, input.props || {});

    const ssrHtml = ReactDOMServer.renderToString(element);
    const staticHtml = ssrHtml.replace(/>\s+</g, "><").trim();

    // React 19 may inject <link rel="preload"/> (and friends) into the SSR tree near where
    // resources are used. That produces valid-but-messy HTML (link tags inside the body/root).
    // We hoist those resource hints up into <head> for a cleaner, more conventional document.
    const hoistedHeadLinks: string[] = [];
    const staticHtmlWithoutHeadLinks = staticHtml.replace(
      /<link\b[^>]*\brel\s*=\s*("|')(?:preload|modulepreload)\1[^>]*>\s*/gi,
      (m) => {
        hoistedHeadLinks.push(m);
        return "";
      }
    );

    // Skip Tailwind CSS extraction; we'll include the Tailwind CDN runtime instead.

    const { version: cdnVersion, dev } = getCdnReactVersion();

    const importStmt = input.exportName
      ? `import { ${input.exportName} as Component } from '${input.moduleName}';`
      : `import Component from '${input.moduleName}';`;

    // Reuse SSR props for hydration so the client tree matches the server output
    const propsObject: Record<string, unknown> = (() => {
      if (input.type === "component") {
        const p = input.props as unknown;
        if (p && typeof p === "object" && !Array.isArray(p)) {
          return p as Record<string, unknown>;
        }
        return {} as Record<string, unknown>;
      }
      const el: unknown = input.element as unknown;
      if (React.isValidElement(el)) {
        const p = (el as React.ReactElement).props as unknown;
        if (p && typeof p === "object" && !Array.isArray(p))
          return p as Record<string, unknown>;
      }
      return {} as Record<string, unknown>;
    })();

    const hydrationCode = `
    import React from 'react';
    import { hydrateRoot, createRoot } from 'react-dom/client';
    ${importStmt}

    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Hydration container #root not found');
    }
    // Trim purely whitespace text nodes so the DOM matches what React expects
    (function removeWhitespaceTextNodes(node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!(child.textContent || '').trim()) node.removeChild(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          removeWhitespaceTextNodes(child);
        }
      }
    })(container);

    const element = React.createElement(Component, ${JSON.stringify(
      propsObject
    )});

    let fallbackTriggered = false;
    // If hydration fails or hits a recoverable error, fall back to a client-only render
    const fallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      container.innerHTML = '';
      const root = createRoot(container);
      root.render(element);
    };

    try {
      hydrateRoot(container, element, {
        onRecoverableError() {
          fallback();
        }
      });
    } catch (e) {
      fallback();
    }
  `;

    const esbuild = await getEsbuild();

    const plugins: Plugin[] = [];
    const mapBare = makeCdnMapper(cdnVersion, dev);

    if (deliveryMode === "inline") {
      // Inline delivery: rewrite bare React imports to CDN URLs and fetch them so the bundle is fully self-contained
      plugins.push({
        name: "bare-to-cdn",
        setup(build: PluginBuild) {
          build.onResolve(
            {
              filter:
                /^(react|react-dom|react-dom\/client|react\/jsx-runtime|react\/jsx-dev-runtime)$/,
            },
            (args: OnResolveArgs) => {
              const url = mapBare(args.path);
              if (url) return { path: url, namespace: "http-url" };
              return null;
            }
          );
        },
      });
      // Fetch and inline any http(s) modules
      plugins.push(makeHttpFetchPlugin());
    } else {
      // Network delivery: rewrite bare imports to CDN URLs and mark them external
      // so esbuild emits `import ... from "https://..."` which the browser loads.
      plugins.push({
        name: "bare-to-cdn-external",
        setup(build: PluginBuild) {
          build.onResolve(
            {
              filter:
                /^(react|react-dom|react-dom\/client|react\/jsx-runtime|react\/jsx-dev-runtime)$/,
            },
            (args: OnResolveArgs) => {
              const url = mapBare(args.path);
              if (url) return { path: url, external: true };
              return null;
            }
          );
        },
      });
      // Do not add http-fetch here; let the browser fetch externals at runtime
    }

    // Provide the virtual source for the component module + any additional modules used by hydration
    const virtualModuleMap: Record<string, string> = {
      [input.moduleName]: input.moduleSource,
      ...(options.virtualModules || {}),
    };
    plugins.push(makeVirtualModulePlugin(virtualModuleMap));

    const result = await esbuild.build({
      bundle: true,
      write: false,
      format: "esm",
      platform: "browser",
      target: ["es2020"],
      minify: true,
      // Safety net: ensure a React binding exists for any modules that still emit React.createElement
      // and expose it globally for third-party code that expects window.React.
      banner: {
        js: `import React from 'react';
try {
  var g = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : self);
  if (g) g.React = React;
} catch {}`,
      },
      define: {
        "process.env.NODE_ENV": '"production"',
        "import.meta.env.MODE": '"production"',
      },
      // Use React 17+ automatic JSX runtime so compiled TSX doesn't require a global React symbol
      jsx: "automatic",
      jsxImportSource: "react",
      stdin: { contents: hydrationCode, loader: "tsx", resolveDir: "/" },
      plugins,
    });

    if (!result.outputFiles || result.outputFiles.length === 0) {
      throw new Error("esbuild did not produce any output files");
    }
    const bundledJs = result.outputFiles[0].text;

    const preconnect =
      deliveryMode === "network"
        ? '<link rel="preconnect" href="https://esm.sh" crossorigin />\n'
        : "";

    // Escape closing </script> so the inline block can't prematurely terminate
    const inlineJsEscaped = bundledJs.replace(/<\/?script>/gi, (m) =>
      m.replace(/\//g, "\\/")
    );

    // Use a custom template if provided; otherwise fall back to a simple default document
    let html: string | null = null;
    if (options.htmlTemplate) {
      const hasStatic = /\{\{\s*STATIC_HTML\s*\}\}/.test(options.htmlTemplate);
      const hasScript = /\{\{\s*INLINE_MODULE_JS\s*\}\}/.test(
        options.htmlTemplate
      );
      if (hasStatic && hasScript) {
        const hasRoot = /id=("|')root\1/.test(options.htmlTemplate);
        const staticSlot = hasRoot
          ? staticHtmlWithoutHeadLinks
          : `<div id="root">${staticHtmlWithoutHeadLinks}</div>`;
        html = options.htmlTemplate
          .replace(/\{\{\s*PRECONNECT\s*\}\}/g, () => preconnect)
          .replace(/\{\{\s*STATIC_HTML\s*\}\}/g, () => staticSlot)
          .replace(/\{\{\s*INLINE_MODULE_JS\s*\}\}/g, () => inlineJsEscaped);
        // Always add Tailwind CDN runtime in the head
        html = html.replace(/<\/head>/i, `${TAILWIND_CDN_TAG}</head>`);
        if (hoistedHeadLinks.length) {
          html = html.replace(
            /<\/head>/i,
            `${hoistedHeadLinks.join("")}</head>`
          );
        }
        if (!hasRoot) {
          console.warn(
            '[generateHtml] Template missing #root. Wrapped STATIC_HTML in <div id="root"> ... </div>.'
          );
        }
      } else {
        console.warn(
          "[generateHtml] htmlTemplate provided but missing required placeholders {{STATIC_HTML}} and/or {{INLINE_MODULE_JS}}. Falling back to default template."
        );
      }
    }

    if (html === null) {
      html = `\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Exported Site</title>\n    <meta name="description" content="SEO-friendly React export built client-side." />\n    ${preconnect}
    ${TAILWIND_CDN_TAG}
    ${hoistedHeadLinks.join("")}
  </head>\n  <body>\n    <div id="root">${staticHtmlWithoutHeadLinks}</div>\n    <script type="module">${inlineJsEscaped}</script>\n  </body>\n</html>\n`;
    }

    const finalResult: GenerateHtmlResult = {
      html,
      previewHtml: staticHtml,
      bundledJs,
    };
    onError?.({ error: 0, data: null });
    return finalResult;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    onError?.({ error: 1, data: message });
    throw e;
  } finally {
    onGenerating?.(false);
  }
}

// Small hook that wraps generateHtml with an isGenerating state guard
export function useHtmlGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  async function run(
    options: GenerateHtmlOptions
  ): Promise<GenerateHtmlResult> {
    if (isGenerating) {
      // Re-entrancy guard; still return a rejected promise to signal busy
      return Promise.reject(new Error("Generation already in progress"));
    }
    setIsGenerating(true);
    try {
      const res = await generateHtml(options);
      return res;
    } finally {
      setIsGenerating(false);
    }
  }

  return { isGenerating, generate: run } as const;
}
