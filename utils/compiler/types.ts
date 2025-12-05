/**
 * React Compiler Types
 *
 * This file contains all the TypeScript interfaces and types used
 * throughout the compiler. Keep your types here so they can be
 * imported anywhere without circular dependency issues.
 */

// ============================================
// SEO & Meta Tags
// ============================================

/**
 * SEO metadata for the generated HTML page.
 * All fields are optional - sensible defaults will be used.
 */
export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

// ============================================
// Build Configuration
// ============================================

/**
 * Build mode determines how React is loaded in the final HTML:
 *
 * - "bundled": React is loaded from CDN but component code is self-contained.
 *              Best for offline support and simpler deployment.
 *
 * - "network": React is loaded from esm.sh CDN using ES modules.
 *              Smaller initial HTML, better caching, but requires internet.
 */
export type BuildMode = "bundled" | "network";

/**
 * Options for compiling React code to HTML.
 *
 * You can either pass:
 * 1. Single file: { code: "...", props, seoMeta }
 * 2. Multiple files: { files: Map, entryFile: "...", props, seoMeta }
 */
export interface CompileOptions {
  code?: string;
  entryFile?: string;
  files?: Map<string, string>;
  props: Record<string, unknown>;
  seoMeta: SeoMeta;
  mode?: BuildMode;
}

/**
 * Result of compiling React code to HTML.
 */
export interface CompileResult {
  html: string;
  componentName: string;
}

// ============================================
// SSR (Server-Side Rendering)
// ============================================

/**
 * Result from rendering a component to HTML string.
 */
export interface SSRResult {
  html: string;
}

/**
 * Options for the SSR rendering process.
 */
export interface SSROptions {
  isBundled?: boolean;
}

// ============================================
// File Resolution (for multi-file bundling)
// ============================================

/**
 * Represents a resolved file with its imports analyzed.
 */
export interface ResolvedFile {
  path: string;
  content: string;
  imports: string[];
}

/**
 * Simple file system interface for resolving imports.
 * Implement this to provide your own file reading logic.
 */
export interface FileSystem {
  readFile: (path: string) => Promise<string>;
  exists: (path: string) => Promise<boolean>;
}

// ============================================
// HTML Generation
// ============================================

/**
 * Options for generating the final HTML document.
 */
export interface HtmlDocumentOptions {
  renderedHTML: string;
  transformedCode: string;
  componentName: string;
  props: Record<string, unknown>;
  seoMeta: SeoMeta;
  mode?: BuildMode;
  isBundled?: boolean;
}
