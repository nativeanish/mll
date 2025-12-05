import type { ResolvedFile, FileSystem } from "./types";

export function extractImports(code: string): string[] {
  const imports: string[] = [];

  const importRegex =
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];

    // Only collect relative imports - packages like 'react' are handled separately
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      imports.push(importPath);
    }
  }

  return imports;
}

export function resolveImportPath(
  currentFile: string,
  importPath: string
): string {
  // Get the directory of the current file
  const lastSlash = currentFile.lastIndexOf("/");
  const currentDir = lastSlash >= 0 ? currentFile.substring(0, lastSlash) : "";

  // Resolve the relative path
  const parts = importPath.split("/");
  const currentParts = currentDir.split("/").filter(Boolean);

  for (const part of parts) {
    if (part === "..") {
      currentParts.pop();
    } else if (part !== ".") {
      currentParts.push(part);
    }
  }

  let resolved = "/" + currentParts.join("/");

  // Add .tsx extension if no extension present
  // (This is a simplification - real resolution would try multiple extensions)
  if (!resolved.match(/\.(tsx?|jsx?|js|ts)$/)) {
    resolved += ".tsx";
  }

  return resolved;
}

export async function resolveAllFiles(
  entryPath: string,
  fs: FileSystem,
  resolved: Map<string, ResolvedFile> = new Map()
): Promise<Map<string, ResolvedFile>> {
  // Already processed this file? Skip it to avoid infinite loops
  if (resolved.has(entryPath)) {
    return resolved;
  }

  // Try to find the file with different extensions
  const extensions = ["", ".tsx", ".ts", ".jsx", ".js"];
  let content: string | null = null;
  let actualPath = entryPath;

  for (const ext of extensions) {
    const tryPath = entryPath + ext;
    if (await fs.exists(tryPath)) {
      content = await fs.readFile(tryPath);
      actualPath = tryPath;
      break;
    }
  }

  if (content === null) {
    console.warn(`Could not resolve file: ${entryPath}`);
    return resolved;
  }

  // Analyze the file's imports
  const imports = extractImports(content);

  // Add this file to our resolved map
  resolved.set(actualPath, {
    path: actualPath,
    content,
    imports,
  });

  // Recursively resolve all imports
  for (const importPath of imports) {
    const resolvedPath = resolveImportPath(actualPath, importPath);
    await resolveAllFiles(resolvedPath, fs, resolved);
  }

  return resolved;
}

export function createViteFileSystem(
  files: Record<string, () => Promise<string>>
): FileSystem {
  const fileMap = new Map<string, () => Promise<string>>();

  for (const [path, loader] of Object.entries(files)) {
    fileMap.set(path, loader);
  }

  return {
    readFile: async (path: string) => {
      const loader = fileMap.get(path);
      if (!loader) {
        throw new Error(`File not found: ${path}`);
      }
      return loader();
    },
    exists: async (path: string) => {
      return fileMap.has(path);
    },
  };
}
