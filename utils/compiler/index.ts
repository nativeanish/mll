export {
  initializeEsbuild,
  isEsbuildReady,
  transformCode,
  cleanTransformedCode,
} from "./esbuild";

export { bundleFiles, extractComponentFromBundle } from "./bundler";

export { renderToString } from "./ssr";

export {
  generateHtmlDocument,
  generateMetaTags,
  generateStructuredData,
} from "./html-generator";

export {
  extractImports,
  resolveImportPath,
  resolveAllFiles,
  createViteFileSystem,
} from "./file-resolver";

export type {
  SeoMeta,
  CompileOptions,
  CompileResult,
  BuildMode,
  SSRResult,
  SSROptions,
  ResolvedFile,
  FileSystem,
  HtmlDocumentOptions,
} from "./types";

// Internal imports for compileToHTML
import { transformCode, cleanTransformedCode } from "./esbuild";
import { bundleFiles } from "./bundler";
import { renderToString } from "./ssr";
import { generateHtmlDocument } from "./html-generator";
import type { CompileOptions, CompileResult } from "./types";

export async function compileToHTML(
  options: CompileOptions
): Promise<CompileResult> {
  const { code, files, entryFile, props, seoMeta, mode = "bundled" } = options;

  let transformedCode: string;
  let componentName: string;
  let isBundled = false;

  // Choose compilation strategy based on what was provided
  if (files && entryFile) {
    // Multi-file: bundle everything together
    const bundled = await bundleFiles(files, entryFile);
    transformedCode = bundled;
    componentName = "App"; // Bundle exports to __AppModule, we extract App from there
    isBundled = true;
  } else if (code) {
    // Single file: just transform and clean
    const rawTransformed = await transformCode(code);
    const cleaned = cleanTransformedCode(rawTransformed);
    transformedCode = cleaned.code;
    componentName = cleaned.componentName;
  } else {
    throw new Error(
      "You need to provide either 'code' for single-file compilation, " +
        "or 'files' + 'entryFile' for multi-file bundling."
    );
  }

  // Render the component to HTML (the SSR magic happens here)
  const { html: renderedHTML } = await renderToString(
    transformedCode,
    componentName,
    props,
    { isBundled }
  );

  // Wrap everything in a complete HTML document
  const html = generateHtmlDocument({
    renderedHTML,
    transformedCode,
    componentName,
    props,
    seoMeta,
    mode,
    isBundled,
  });

  return { html, componentName };
}
