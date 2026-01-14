import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import React from "react";

interface LocalFileMeta {
  id: string;
  url: string;
  name: string;
  title: string;
  size: number;
  type: string;
}

function formatBytes(bytes?: number) {
  const b = typeof bytes === "number" && Number.isFinite(bytes) ? bytes : 0;
  if (b <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(
    Math.floor(Math.log(b) / Math.log(1024)),
    units.length - 1
  );
  const value = b / Math.pow(1024, idx);
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function getExtension(name?: string) {
  if (!name) return "";
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === name.length - 1) return "";
  return name.slice(lastDot + 1).toUpperCase();
}

function safeFilesFromData(data: Record<string, unknown>): LocalFileMeta[] {
  const raw = data.files;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : "";
      const url = typeof r.url === "string" ? r.url : "";
      const name = typeof r.name === "string" ? r.name : "";
      const title = typeof r.title === "string" ? r.title : "";
      const size = typeof r.size === "number" ? r.size : 0;
      const type = typeof r.type === "string" ? r.type : "";
      if (!id || !url || !name) return null;
      return { id, url, name, title, size, type };
    })
    .filter(Boolean) as LocalFileMeta[];
}

function downloadViaAnchor(url: string, filename?: string) {
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    if (filename) a.download = filename;
    a.click();
  } catch {
    // Fallback
    window.open(url, "_blank", "noopener");
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function FileCard({ file }: { file: LocalFileMeta }) {
  const [copied, setCopied] = React.useState(false);

  const label = (file.title || "").trim() || file.name;
  const ext =
    getExtension(file.name) ||
    (file.type ? file.type.split("/")[1]?.toUpperCase() : "");
  const meta = [formatBytes(file.size)].filter(Boolean).join(" • ");

  return (
    <div
      className="group w-full min-w-0 p-4 rounded-2xl text-slate-950 bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-yellow-400 dark:text-white dark:bg-slate-900/60 dark:border-white/10 dark:hover:border-yellow-400/50"
      role="group"
    >
      <div className="h-1 w-full rounded-full bg-yellow-400 mb-4" />
      <div className="flex items-start gap-4 min-w-0">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center transition-colors group-hover:bg-yellow-200 dark:bg-yellow-400/15 dark:border-yellow-400/25 dark:group-hover:bg-yellow-400/20">
          <span className="text-[10px] font-semibold tracking-wide select-none text-slate-950/80 dark:text-white/90">
            {ext || "FILE"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" title={label}>
            {label}
          </div>
          {meta && (
            <div className="text-[10px] text-slate-600 dark:text-white/60 mt-1">
              {meta}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          className="h-9 px-4 rounded-xl bg-white text-slate-950 text-sm font-semibold border border-slate-200 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white/10 dark:text-white dark:border-white/15 dark:hover:bg-white/15 dark:focus-visible:ring-yellow-400/40 dark:focus-visible:ring-offset-slate-950"
          onClick={async () => {
            const ok = await copyToClipboard(file.url);
            if (!ok) return;
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          aria-label="Copy file URL"
          title="Copy link"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          className="shrink-0 h-9 px-4 rounded-xl bg-slate-950 text-white text-sm font-semibold transition-all duration-200 hover:bg-yellow-400 hover:text-slate-950 hover:shadow-md hover:shadow-yellow-400/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-yellow-400 dark:focus-visible:ring-yellow-400/40 dark:focus-visible:ring-offset-slate-950"
          onClick={() => downloadViaAnchor(file.url, file.name)}
          aria-label="Download file"
          title="Download"
        >
          Download
        </button>
      </div>
    </div>
  );
}

function File({ props }: { props: BlockData }) {
  const { description } = getStringFields(props.data, ["description"]);
  const files = safeFilesFromData(props.data);

  if (!files.length && !description) return null;

  return (
    <div
      className="w-full"
      data-uuid={props.id}
      data-description={description || undefined}
    >
      {!files.length ? (
        <div className="p-4 rounded-2xl text-slate-950 text-sm bg-white border border-slate-200 shadow-sm dark:text-white dark:bg-slate-900/60 dark:border-white/10">
          No files available.
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

export default File;
