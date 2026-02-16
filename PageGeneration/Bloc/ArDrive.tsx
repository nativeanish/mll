import type { BlockData } from "@/store/useBlockStore";
import React from "react";

/* ── types ── */

interface DriveInfo {
  driveId?: string;
  nodeId?: string;
  name?: string;
  rootFolderId?: string;
}

interface DriveFile {
  nodeId?: string;
  name?: string;
  size?: number;
  dataContentType?: string;
  dataTxId?: string;
  lastModifiedDate?: number;
  pinned?: boolean;
}

function useIsMobile(mobileBreakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < mobileBreakpoint);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/* ── helpers ── */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === "object";

function parseDrive(raw: unknown): DriveInfo | null {
  if (!isRecord(raw)) return null;
  return {
    driveId: typeof raw.driveId === "string" ? raw.driveId : undefined,
    nodeId: typeof raw.nodeId === "string" ? raw.nodeId : undefined,
    name: typeof raw.name === "string" ? raw.name : undefined,
    rootFolderId:
      typeof raw.rootFolderId === "string" ? raw.rootFolderId : undefined,
  };
}

function parseFiles(raw: unknown): DriveFile[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!isRecord(item)) return null;
      return {
        nodeId: typeof item.nodeId === "string" ? item.nodeId : undefined,
        name: typeof item.name === "string" ? item.name : undefined,
        size: typeof item.size === "number" ? item.size : 0,
        dataContentType:
          typeof item.dataContentType === "string"
            ? item.dataContentType
            : undefined,
        dataTxId: typeof item.dataTxId === "string" ? item.dataTxId : undefined,
        lastModifiedDate:
          typeof item.lastModifiedDate === "number" ? item.lastModifiedDate : 0,
        pinned: typeof item.pinned === "boolean" ? item.pinned : false,
      };
    })
    .filter(Boolean) as DriveFile[];
}

function formatBytes(bytes?: number): string {
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

function getExtension(name?: string): string {
  if (!name) return "";
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === name.length - 1) return "";
  return name.slice(lastDot + 1).toUpperCase();
}

function extColor(ext: string): string {
  const e = ext.toLowerCase();
  if (["pdf"].includes(e)) return "bg-[#FF6B6B] text-black";
  if (["doc", "docx"].includes(e)) return "bg-[#6366F1] text-white";
  if (["xls", "xlsx", "csv", "json"].includes(e))
    return "bg-[#4ECDC4] text-black";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(e))
    return "bg-[#A855F7] text-white";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e))
    return "bg-[#FFE66D] text-black";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e))
    return "bg-[#FF6B6B] text-black";
  if (["mp3", "wav", "ogg", "flac"].includes(e))
    return "bg-[#4ECDC4] text-black";
  if (["html", "css", "js", "ts", "tsx"].includes(e))
    return "bg-[#FFE66D] text-black";
  return "bg-gray-200 text-black";
}

/* ── ArDrive branding ── */

const ARDRIVE_LOGO =
  "https://arweave.net/ZFUL1s0jYcKZDuTWjdhV9zLjUXps5xity2np-x0OyR0";
const ARDRIVE_POWERED_BY_URL =
  "https://ardrive.io/?utm_campaign=poweredbyardrive&utm_medium=affiliate&utm_source=metalinks";

/* ── Compact file tile (neobrutalism, grid-friendly) ── */

function FileTile({ file }: { file: DriveFile }) {
  const name = file.name || "Unknown file";
  const ext = getExtension(name);
  const arweaveUrl = file.dataTxId
    ? `https://arweave.net/${file.dataTxId}`
    : "";

  return (
    <button
      type="button"
      onClick={() => arweaveUrl && window.open(arweaveUrl, "_blank")}
      className="group flex flex-col items-center gap-1.5 rounded-lg border-[2.5px] border-black bg-white p-2.5 shadow-[3px_3px_0px_#000] transition-all hover:shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000] cursor-pointer w-full"
      title={`${name} — ${formatBytes(file.size)}`}
    >
      {/* ext badge */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-md border-2 border-black text-[0.55rem] font-black uppercase tracking-wider ${extColor(ext)}`}
      >
        {ext || "FILE"}
      </div>

      {/* name */}
      <p className="w-full truncate text-center text-[0.65rem] font-bold text-black leading-tight">
        {name}
      </p>

      {/* size */}
      <p className="text-[0.55rem] text-black/40 font-semibold leading-none">
        {formatBytes(file.size)}
      </p>
    </button>
  );
}

/* ── Main component ── */

function ArDrive({ props }: { props: BlockData }) {
  const [expanded, setExpanded] = React.useState(false);
  const isMobile = useIsMobile();
  const data = isRecord(props.data) ? props.data : {};

  const drive = parseDrive(data.selectedDrive);
  const pinnedFiles = parseFiles(data.pinnedFiles);

  /* show 1 row by default: 3 on mobile, 5 on desktop */
  const MAX_VISIBLE = isMobile ? 3 : 5;
  const visibleFiles = expanded
    ? pinnedFiles
    : pinnedFiles.slice(0, MAX_VISIBLE);
  const hasMore = pinnedFiles.length > MAX_VISIBLE;

  const driveUrl = drive?.driveId
    ? `https://app.ardrive.io/#/drives/${drive.driveId}?name=${encodeURIComponent(drive.name || "drive")}`
    : "";

  /* ── empty state ── */
  if (!drive || !drive.driveId) {
    return (
      <div
        className="w-full rounded-md border-[2.5px] border-black bg-[#FFE66D] px-4 py-3 text-center shadow-[3px_3px_0px_#000]"
        data-uuid={props.id}
      >
        <span className="text-sm font-extrabold text-black uppercase tracking-wide">
          No ArDrive configured
        </span>
        <p className="text-[11px] text-black/60 mt-0.5">
          Add an ArDrive block in the editor to display files here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-md border-[2.5px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden"
      data-uuid={props.id}
    >
      {/* ── header ── */}
      <div className="flex items-center gap-3 px-3.5 py-3 bg-[#FAFAFA] border-b-[2.5px] border-black">
        {/* logo */}
        <div className="h-10 w-10 rounded-lg border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_#000] shrink-0">
          <img
            src={ARDRIVE_LOGO}
            alt="ArDrive"
            className="h-full w-full object-contain"
          />
        </div>

        {/* drive info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-black truncate leading-tight">
              {drive.name || "ArDrive"}
            </span>
          </div>
          <div className="text-[10px] text-black/45 font-bold truncate leading-tight">
            ArDrive · Permanent Storage
          </div>
        </div>

        {/* open button */}
        {driveUrl && (
          <button
            className="shrink-0 rounded border-2 border-black bg-[#1A1A2E] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            onClick={() => window.open(driveUrl, "_blank")}
          >
            Open Drive ↗
          </button>
        )}
      </div>

      {/* ── pinned files ── */}
      <div className="px-3.5 py-3 space-y-2.5">
        {pinnedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-black bg-[#FFE66D] px-4 py-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black mb-2"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
            <p className="text-xs font-bold text-black">No pinned files</p>
            <p className="text-[10px] text-black/60 mt-0.5">
              Pin files in the editor to showcase them here.
            </p>
          </div>
        ) : (
          <>
            {/* pinned label */}
            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center gap-1 rounded border-2 border-black bg-[#FF6B6B] px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 17v5M9 3h6l1 7h1a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4h1l1-7z" />
                </svg>
                {pinnedFiles.length} Pinned
              </div>
            </div>

            {/* file grid: 3 cols mobile, 5 cols lg */}
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {visibleFiles.map((file) => (
                <FileTile key={file.nodeId || file.name} file={file} />
              ))}
            </div>

            {/* expand / collapse */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 rounded-lg border-[3px] border-black bg-[#FFE66D] py-2 text-[0.7rem] font-bold uppercase text-black shadow-[3px_3px_0px_#000] transition-all hover:shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {expanded ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    +{pinnedFiles.length - MAX_VISIBLE} More Files
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── footer ── */}
      <div className="flex items-center justify-between border-t-[2.5px] border-black bg-[#F5F5F5] px-3.5 py-2">
        <a
          href={ARDRIVE_POWERED_BY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold text-black/50 uppercase tracking-wider cursor-pointer"
        >
          <img
            src={ARDRIVE_LOGO}
            alt="ArDrive"
            className="h-4 w-4 object-contain"
          />
          Powered by ArDrive
        </a>
        <div className="text-[10px] text-black/40 font-semibold">
          Permanent · Decentralized
        </div>
      </div>
    </div>
  );
}

export default ArDrive;
