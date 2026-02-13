import type { BlockData } from "@/store/useBlockStore";
import type { JSX } from "react";

type TokenStatus = "certified" | "normal" | "unavailable" | "evil";

type TokenSnapshot = {
  process?: string;
  decimals?: number;
  symbol?: string;
  fullName?: string;
  logo?: string;
  totalSupply?: string;
  price?: string;
  status?: TokenStatus;
  tokenAccessible?: boolean;
};

type AggregatedStats = {
  totalTrades24H?: number;
  totalVolume24H?: number;
  totalVolume7D?: number;
  poolCount?: number;
};

type DisplayOptionKey =
  | "decimals"
  | "totalSupply"
  | "tokenStatus"
  | "aggregatedStats"
  | "lastUpdated"
  | "refreshNote";

const DEFAULT_DISPLAY_OPTIONS: Record<DisplayOptionKey, boolean> = {
  decimals: true,
  totalSupply: true,
  tokenStatus: true,
  aggregatedStats: true,
  lastUpdated: true,
  refreshNote: true,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const formatNumber = (value: unknown, decimals: number = 2): string => {
  const num = toNumber(value) ?? 0;
  if (num >= 1_000_000_000)
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

const formatSupply = (supply: unknown, decimals: number): string => {
  const base = toNumber(supply);
  if (base === null) return "0";
  const adjusted = base / Math.pow(10, decimals || 0);
  return formatNumber(adjusted, 2);
};

const parseDisplayOptions = (
  raw: unknown,
): Record<DisplayOptionKey, boolean> => {
  const result = { ...DEFAULT_DISPLAY_OPTIONS };
  if (!isRecord(raw)) return result;
  (Object.keys(DEFAULT_DISPLAY_OPTIONS) as DisplayOptionKey[]).forEach(
    (key) => {
      const val = raw[key];
      if (typeof val === "boolean") result[key] = val;
    },
  );
  return result;
};

const parseToken = (raw: unknown): TokenSnapshot | null => {
  if (!isRecord(raw)) return null;
  return {
    process: typeof raw.process === "string" ? raw.process : undefined,
    decimals: typeof raw.decimals === "number" ? raw.decimals : undefined,
    symbol: typeof raw.symbol === "string" ? raw.symbol : undefined,
    fullName: typeof raw.fullName === "string" ? raw.fullName : undefined,
    logo: typeof raw.logo === "string" ? raw.logo : undefined,
    totalSupply:
      typeof raw.totalSupply === "string" || typeof raw.totalSupply === "number"
        ? String(raw.totalSupply)
        : undefined,
    price:
      typeof raw.price === "string" || typeof raw.price === "number"
        ? String(raw.price)
        : undefined,
    status:
      typeof raw.status === "string" ? (raw.status as TokenStatus) : undefined,
    tokenAccessible:
      typeof raw.tokenAccessible === "boolean"
        ? raw.tokenAccessible
        : undefined,
  };
};

const parseAggregatedStats = (raw: unknown): AggregatedStats | null => {
  if (!isRecord(raw)) return null;
  const totalTrades24H = toNumber(raw.totalTrades24H);
  const totalVolume24H = toNumber(raw.totalVolume24H);
  const totalVolume7D = toNumber(raw.totalVolume7D);
  const poolCount = toNumber(raw.poolCount);

  const hasValue =
    totalTrades24H !== null ||
    totalVolume24H !== null ||
    totalVolume7D !== null ||
    poolCount !== null;

  if (!hasValue) return null;

  return {
    totalTrades24H: totalTrades24H ?? undefined,
    totalVolume24H: totalVolume24H ?? undefined,
    totalVolume7D: totalVolume7D ?? undefined,
    poolCount: poolCount ?? undefined,
  };
};

const getStatusVisuals = (status: TokenStatus | undefined) => {
  const variants: Record<
    TokenStatus,
    { label: string; badge: string; icon: JSX.Element }
  > = {
    certified: {
      label: "Certified",
      badge: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: <IconCheckCircle className="h-4 w-4 text-blue-600" />,
    },
    normal: {
      label: "Normal",
      badge: "bg-green-50 text-green-700 border border-green-200",
      icon: <div className="h-2.5 w-2.5 rounded-full bg-green-500" />,
    },
    unavailable: {
      label: "Unavailable",
      badge: "bg-gray-50 text-gray-700 border border-gray-200",
      icon: <IconHelpCircle className="h-4 w-4 text-gray-500" />,
    },
    evil: {
      label: "Warning",
      badge: "bg-red-50 text-red-700 border border-red-200",
      icon: <IconAlertTriangle className="h-4 w-4 text-red-600" />,
    },
  };

  return variants[status || "normal"];
};

type TokenInfoProps = { pros?: BlockData; props?: BlockData };

function TokenInfo({ pros, props }: TokenInfoProps) {
  const block = pros ?? props;
  if (!block) return null;

  const rawData = isRecord(block.data) ? block.data : {};
  const token = parseToken(rawData.token);
  const displayOptions = parseDisplayOptions(rawData.displayOptions);
  const aggregatedStats = displayOptions.aggregatedStats
    ? parseAggregatedStats(rawData.aggregatedStats)
    : null;
  const lastUpdatedString =
    typeof rawData.lastUpdated === "string" ? rawData.lastUpdated : null;
  const lastUpdated = lastUpdatedString ? new Date(lastUpdatedString) : null;

  if (!token) {
    return (
      <div className="w-full p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-700 shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <IconBarChart className="h-6 w-6" />
        </div>
        <div className="text-sm font-semibold">No token selected</div>
        <div className="text-xs text-slate-500 mt-1">
          Choose a token in the editor to show its market snapshot.
        </div>
      </div>
    );
  }

  const statusVisuals = getStatusVisuals(token.status);
  const price = toNumber(token.price);
  const decimals = typeof token.decimals === "number" ? token.decimals : 0;

  return (
    <div className="w-full space-y-3" data-uuid={block.id}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="relative">
            {token.logo ? (
              <img
                src={`https://arweave.net/${token.logo}`}
                alt={token.symbol || "Token"}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500/20 to-indigo-500/40 flex items-center justify-center border-2 border-white shadow">
                <span className="text-lg font-bold text-slate-900">
                  {(token.symbol || "?").charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-slate-900 truncate">
                  {token.symbol || "Unknown"}
                </div>
                {token.fullName && (
                  <div className="text-xs text-slate-600 truncate">
                    {token.fullName}
                  </div>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusVisuals.badge}`}
              >
                {statusVisuals.icon}
                <span>{statusVisuals.label}</span>
              </span>
            </div>

            {price !== null && price > 0 && (
              <div className="mt-2">
                <div className="text-xl font-bold text-blue-600">
                  ${price.toFixed(6)}
                </div>
                <div className="text-[11px] text-slate-500">Current price</div>
              </div>
            )}
          </div>
        </div>

        {(displayOptions.decimals ||
          displayOptions.totalSupply ||
          displayOptions.tokenStatus) && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
              <IconBarChart className="h-4 w-4 text-blue-600" />
              Basic Stats
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 text-center pb-1">
              {displayOptions.decimals && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-2.5 py-2 min-w-[150px]">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <IconActivity className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-blue-700 leading-tight">
                      Decimals
                    </div>
                    <div className="text-base font-bold text-blue-800 leading-tight">
                      {decimals}
                    </div>
                  </div>
                </div>
              )}

              {displayOptions.totalSupply && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-2 min-w-[150px]">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <IconBarChart className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-emerald-700 leading-tight">
                      Total Supply
                    </div>
                    <div className="text-base font-bold text-emerald-800 leading-tight">
                      {formatSupply(token.totalSupply, decimals)}
                    </div>
                  </div>
                </div>
              )}

              {displayOptions.tokenStatus && (
                <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 px-2.5 py-2 min-w-[170px]">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <IconCheckCircle className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-purple-700 leading-tight">
                      Status
                    </div>
                    <div className="text-base font-bold text-purple-800 leading-tight">
                      {token.tokenAccessible ? "Available" : "Unavailable"}
                    </div>
                    <div className="text-[10px] text-purple-700 leading-tight">
                      {token.tokenAccessible
                        ? "Trading active"
                        : "Trading paused"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {displayOptions.aggregatedStats && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
              <IconTrendingUp className="h-4 w-4 text-blue-600" />
              Aggregated pool statistics
            </div>

            {!aggregatedStats ? (
              <div className="text-xs text-slate-500 text-center">
                No pool data captured yet.
              </div>
            ) : (
              <div className="flex flex-nowrap overflow-x-auto gap-2 text-center pb-1">
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-2.5 py-2 min-w-[150px]">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <IconActivity className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-blue-700 leading-tight">
                      24h Trade Count
                    </div>
                    <div className="text-base font-bold text-blue-800 leading-tight">
                      {formatNumber(aggregatedStats.totalTrades24H ?? 0, 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2.5 py-2 min-w-[150px]">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <IconBarChart className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-emerald-700 leading-tight">
                      24h Volume
                    </div>
                    <div className="text-base font-bold text-emerald-800 leading-tight">
                      ${formatNumber(aggregatedStats.totalVolume24H ?? 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 px-2.5 py-2 min-w-[150px]">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <IconTrendingUp className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[10px] text-purple-700 leading-tight">
                      7d Volume
                    </div>
                    <div className="text-base font-bold text-purple-800 leading-tight">
                      ${formatNumber(aggregatedStats.totalVolume7D ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aggregatedStats?.poolCount !== undefined && (
              <div className="mt-2 text-xs text-slate-600">
                Active in {aggregatedStats.poolCount} pools
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={token.tokenAccessible === false}
            onClick={() => {
              const target = token.process || token.symbol;
              if (!target) return;
              const url = `https://permaswap.network/#/trade/${encodeURIComponent(target)}`;
              if (typeof window !== "undefined") {
                window.open(url, "_blank", "noopener");
              }
            }}
          >
            Trade
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          {displayOptions.lastUpdated && lastUpdated && (
            <span className="inline-flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {displayOptions.refreshNote && (
            <span className="inline-flex items-center gap-1">
              Data refreshes automatically every 10 minutes in the editor.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TokenInfo;

function IconBase({
  className,
  children,
  viewBox = "0 0 24 24",
}: {
  className?: string;
  children: JSX.Element | JSX.Element[];
  viewBox?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function IconActivity({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconBase>
  );
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  );
}

function IconBarChart({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </IconBase>
  );
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </IconBase>
  );
}

function IconHelpCircle({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconBase>
  );
}

function IconTrendingUp({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </IconBase>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </IconBase>
  );
}
