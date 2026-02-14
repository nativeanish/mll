import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SVGProps } from "react";
import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";

type PoolStatus = "normal" | "certified" | "evil" | string;

type Pool = {
  process: string;
  name: string;
  x: string;
  y: string;
  symbolX: string;
  symbolY: string;
  fullNameX?: string;
  fullNameY?: string;
  fee?: string;
  logoX?: string;
  logoY?: string;
  poolStatus?: PoolStatus;
  accessible?: boolean;
  xUsdPrice?: string;
  yUsdPrice?: string;
};

type SwapInputKey = "x" | "y";

const REFETCH_INTERVAL_MS = 60_000;

type IconProps = SVGProps<SVGSVGElement>;

const ArrowLeftRight = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 7h10l-3-3" />
    <path d="M16 17H6l3 3" />
    <path d="M7 12h10" />
  </svg>
);

const RefreshCw = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 2v6h-6" />
    <path d="M3 22v-6h6" />
    <path d="M20.49 9a9 9 0 0 0-15.36-3.36L3 8" />
    <path d="M3.51 15A9 9 0 0 0 18.87 18.3L21 16" />
  </svg>
);

const AlertTriangle = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10.3 3.9 1.8 18.1A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ExternalLink = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

const formatAmount = (value: number, decimals = 6) => {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString(undefined, {
    useGrouping: false,
    maximumFractionDigits: decimals,
  });
};

const sanitizeInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const segments = cleaned.split(".");
  if (segments.length <= 1) return cleaned;
  return `${segments[0]}.${segments.slice(1).join("")}`;
};

function Swap({ props }: { props: BlockData }) {
  const { poolProcess, poolName, lastInputX, lastInputY } = getStringFields(
    props.data,
    ["poolProcess", "poolName", "lastInputX", "lastInputY"],
  );

  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [manualRefreshing, setManualRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [inputs, setInputs] = useState<{ x: string; y: string }>(() => ({
    x: lastInputX || "",
    y: lastInputY || "",
  }));
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const isActiveRef = useRef(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // React 18 StrictMode replays effects; reset active flag on each run to keep fetches enabled
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const fetchPools = useCallback(async (opts?: { manual?: boolean }) => {
    if (isFetchingRef.current || !isActiveRef.current) return;
    const isManual = Boolean(opts?.manual);
    isFetchingRef.current = true;
    try {
      if (isManual) {
        setManualRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await fetch(
        "https://api-ffpscan.permaswap.network/pools",
      );
      if (!response.ok) throw new Error("Failed to fetch pools");
      const data = (await response.json()) as Pool[];
      if (!isActiveRef.current) return;
      setPools(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      if (!isActiveRef.current) return;
      console.error(err);
      setError("Unable to load pools right now.");
    } finally {
      if (isActiveRef.current) {
        if (isManual) {
          setManualRefreshing(false);
        } else {
          setLoading(false);
        }
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPools();
    const interval = window.setInterval(
      () => fetchPools(),
      REFETCH_INTERVAL_MS,
    );
    return () => {
      window.clearInterval(interval);
    };
  }, [fetchPools]);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.process === poolProcess),
    [pools, poolProcess],
  );

  const priceX = useMemo(() => {
    if (!selectedPool) return 0;
    const value = Number(selectedPool.xUsdPrice ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [selectedPool]);

  const priceY = useMemo(() => {
    if (!selectedPool) return 0;
    const value = Number(selectedPool.yUsdPrice ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [selectedPool]);

  const pricesAvailable = priceX > 0 && priceY > 0;

  const handleInputChange = (field: SwapInputKey, rawValue: string) => {
    const otherField: SwapInputKey = field === "x" ? "y" : "x";
    const sanitized = sanitizeInput(rawValue);

    setInputs((prev) => {
      const next = { ...prev, [field]: sanitized };

      if (!selectedPool) {
        next[otherField] = "";
        setCalculationError(null);
        return next;
      }

      if (!pricesAvailable) {
        next[otherField] = "";
        setCalculationError("Live pricing unavailable");
        return next;
      }

      const numeric = Number(sanitized);
      if (!sanitized.trim() || Number.isNaN(numeric)) {
        next[otherField] = "";
        setCalculationError(null);
        return next;
      }

      const computed =
        field === "x"
          ? (numeric * priceX) / priceY
          : (numeric * priceY) / priceX;

      if (!Number.isFinite(computed)) {
        next[otherField] = "";
        setCalculationError("Unable to estimate swap");
        return next;
      }

      next[otherField] = formatAmount(computed, 8);
      setCalculationError(null);
      return next;
    });
  };

  const handleSwap = () => {
    if (!selectedPool) return;
    const url = `https://www.permaswap.network/#/ao/${selectedPool.x}%26${selectedPool.y}`;
    window.open(url, "_blank", "noopener");
  };

  const renderLogo = (logo: string | undefined, symbol: string, size = 40) => {
    if (logo) {
      return (
        <img
          src={`https://arweave.net/${logo}`}
          alt={symbol}
          className="rounded-full object-cover"
          style={{ height: size, width: size }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      );
    }
    return (
      <div
        className="flex items-center justify-center rounded-full bg-[#A855F7]"
        style={{ height: size, width: size }}
      >
        <span className="text-sm font-semibold text-primary">
          {symbol?.slice(0, 2) || "?"}
        </span>
      </div>
    );
  };

  const renderTokenCard = (field: SwapInputKey) => {
    if (!selectedPool) return null;
    const symbol = field === "x" ? selectedPool.symbolX : selectedPool.symbolY;
    const fullName =
      field === "x" ? selectedPool.fullNameX : selectedPool.fullNameY;
    const logo = field === "x" ? selectedPool.logoX : selectedPool.logoY;
    const price = field === "x" ? priceX : priceY;
    const value = inputs[field];

    return (
      <div className="rounded-lg border-[3px] border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
        <div className="flex items-center gap-3">
          {renderLogo(logo, symbol, 44)}
          <div className="min-w-0">
            <div className="text-sm font-bold text-black truncate">
              {symbol || "-"}
            </div>
            <div className="text-xs text-black/70 truncate">
              {fullName || "Unnamed token"}
            </div>
          </div>
          <span className="ml-auto rounded-lg bg-[#FFE66D] border-2 border-black px-3 py-1 text-[11px] font-bold text-black">
            ${price > 0 ? formatAmount(price, 4) : "—"}
          </span>
        </div>

        <div className="mt-3 space-y-1">
          <label className="text-[10px] uppercase tracking-wide text-black font-bold">
            Amount
          </label>
          <input
            value={value}
            onChange={(event) => handleInputChange(field, event.target.value)}
            placeholder="0.0"
            inputMode="decimal"
            className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 text-sm font-semibold text-black shadow-[2px_2px_0px_#000] focus:shadow-none focus:translate-x-0.5 focus:translate-y-0.5 focus:outline-none"
          />
        </div>
      </div>
    );
  };

  if (!poolProcess) {
    return (
      <div
        className="w-full rounded-lg border-[3px] border-dashed border-black bg-[#FFE66D] p-6 text-center text-black"
        data-uuid={props.id}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white border-[3px] border-black">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div className="text-sm font-bold">No pool selected</div>
        <div className="text-xs text-black/70 mt-1">
          Choose a Permaswap pool in the editor to render this swap block.
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-xl mx-auto rounded-lg border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_#000]"
      data-uuid={props.id}
      data-description={poolName || undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/70">
            Permaswap
          </p>
          <h3 className="text-2xl font-bold text-black leading-tight uppercase">
            {poolName || "Selected pool"}
          </h3>
          <p className="font-mono text-[11px] text-black/50 break-all">
            {poolProcess}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchPools({ manual: true })}
          className="flex items-center gap-2 rounded-lg border-[3px] border-black bg-[#FFE66D] px-3.5 py-1.5 text-[11px] font-bold text-black shadow-[2px_2px_0px_#000] transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#000]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 text-black">
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading || manualRefreshing ? "animate-spin" : ""}`}
            />
          </span>
          <span className="pr-0.5">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Tap to refresh"}
          </span>
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border-[3px] border-black bg-[#FF6B6B] px-3 py-2 text-sm text-black font-bold">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && !selectedPool && (
        <div className="mt-4 rounded-lg border-[3px] border-black bg-[#FFE66D] px-4 py-3 text-sm text-black font-bold">
          Pool not found in latest listing. It may have been removed or renamed.
        </div>
      )}

      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="h-28 animate-pulse rounded-lg bg-gray-200 border-[3px] border-black" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 border-[3px] border-black" />
        </div>
      ) : selectedPool ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3">
            {renderTokenCard("x")}
            <div className="flex items-center justify-center text-black">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFE66D] border-[3px] border-black shadow-[3px_3px_0px_#000]">
                <ArrowLeftRight className="h-4.5 w-4.5" />
              </div>
            </div>
            {renderTokenCard("y")}
          </div>

          {calculationError ? (
            <div className="flex items-center gap-2 rounded-lg border-[3px] border-black bg-[#FF6B6B] px-3 py-2 text-sm text-black font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>{calculationError}</span>
            </div>
          ) : pricesAvailable ? (
            <div className="rounded-lg border-[3px] border-black bg-white px-4 py-3 text-xs text-black/70">
              <p className="font-bold text-black">
                1 {selectedPool.symbolX} ≈ {formatAmount(priceX / priceY, 6)}{" "}
                {selectedPool.symbolY}
              </p>
              <p className="font-bold text-black">
                1 {selectedPool.symbolY} ≈ {formatAmount(priceY / priceX, 6)}{" "}
                {selectedPool.symbolX}
              </p>
              <p className="text-[11px] text-black/50">
                Prices refresh every minute.
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSwap}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-black px-5 py-3.5 text-sm font-bold text-white uppercase shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none focus:outline-none"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Trade</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default Swap;
