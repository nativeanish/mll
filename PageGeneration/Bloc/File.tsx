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
    units.length - 1,
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

/* ------------------------------------------------------------------ */
/*  Ext color mapping                                                 */
/* ------------------------------------------------------------------ */

function extColor(ext: string): string {
  const e = ext.toLowerCase();
  if (["pdf"].includes(e)) return "bg-red-100 text-red-700";
  if (["doc", "docx"].includes(e)) return "bg-blue-100 text-blue-700";
  if (["xls", "xlsx", "csv"].includes(e)) return "bg-green-100 text-green-700";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(e))
    return "bg-purple-100 text-purple-700";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e))
    return "bg-amber-100 text-amber-700";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e))
    return "bg-pink-100 text-pink-700";
  if (["mp3", "wav", "ogg", "flac"].includes(e))
    return "bg-cyan-100 text-cyan-700";
  return "bg-slate-100 text-slate-600";
}

/* ------------------------------------------------------------------ */
/*  FileCard                                                          */
/* ------------------------------------------------------------------ */

function FileCard({ file }: { file: LocalFileMeta }) {
  const [copied, setCopied] = React.useState(false);

  const label = (file.title || "").trim() || file.name;
  const ext =
    getExtension(file.name) ||
    (file.type ? file.type.split("/")[1]?.toUpperCase() : "");
  const showOriginalName = label !== file.name;

  return (
    <div className="group w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-center gap-3.5 p-4">
        {/* extension badge */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-bold uppercase tracking-wider ${extColor(ext)}`}
        >
          {ext || "FILE"}
        </div>

        {/* file info */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-slate-800"
            title={label}
          >
            {label}
          </p>
          {showOriginalName && (
            <p
              className="truncate text-xs text-slate-400 mt-0.5"
              title={file.name}
            >
              {file.name}
            </p>
          )}
          <p className="text-[0.7rem] text-slate-400 mt-0.5">
            {formatBytes(file.size)}
            {file.type ? ` · ${file.type}` : ""}
          </p>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center border-t border-slate-100">
        <button
          type="button"
          onClick={async () => {
            const ok = await copyToClipboard(file.url);
            if (!ok) return;
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors rounded-bl-xl cursor-pointer"
          aria-label="Copy file URL"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            {copied ? (
              <>
                <path d="M20 6 9 17l-5-5" />
              </>
            ) : (
              <>
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </>
            )}
          </svg>
          {copied ? "Copied!" : "Copy link"}
        </button>

        <div className="w-px h-5 bg-slate-100" />

        <button
          type="button"
          onClick={() => downloadViaAnchor(file.url, file.name)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors rounded-br-xl cursor-pointer"
          aria-label="Download file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition-transform group-hover:translate-y-0.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  File (main)                                                       */
/* ------------------------------------------------------------------ */

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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-300 mb-3"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          <p className="text-sm font-medium text-slate-500">No files yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Files shared here will appear when available.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

export default File;
