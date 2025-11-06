import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useBlockStore } from "@/store/useBlockStore";
import { toast } from "sonner";

interface BlockForTokenSwapProps {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
  onExitEdit?: () => void;
}

type PoolStatus = "normal" | "certified" | "evil" | string;

interface Pool {
  process: string;
  x: string;
  y: string;
  fee: string;
  symbolX: string;
  symbolY: string;
  decimalX: number;
  decimalY: number;
  fullNameX: string;
  fullNameY: string;
  logoX: string;
  logoY: string;
  poolStatus: PoolStatus;
  xUsdPrice: string;
  yUsdPrice: string;
  name: string;
  accessible: boolean;
  reverseSymbol: boolean;
}

type SwapInputKey = "x" | "y";

interface StoredSwapData {
  poolProcess?: string;
  lastInputX?: string;
  lastInputY?: string;
}

const REFETCH_INTERVAL = 60_000;

function BlockForTokenSwap({
  isEdit,
  setError,
  uuid,
  onExitEdit,
}: BlockForTokenSwapProps) {
  const updateBlockData = useBlockStore((state) => state.updateBlockData);
  const storedData = useBlockStore((state) => {
    const block = state.blocks.find((entry) => entry.id === uuid);
    return (block?.data as StoredSwapData | undefined) ?? undefined;
  });

  const [selectedPoolProcess, setSelectedPoolProcess] = useState<string>(
    storedData?.poolProcess ?? ""
  );
  const [inputs, setInputs] = useState<{ x: string; y: string }>(() => ({
    x: storedData?.lastInputX ?? "",
    y: storedData?.lastInputY ?? "",
  }));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<SwapInputKey>("x");
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPoolProcess && storedData?.poolProcess) {
      setSelectedPoolProcess(storedData.poolProcess);
    }
    if (!inputs.x && storedData?.lastInputX) {
      setInputs((prev) => ({ ...prev, x: storedData.lastInputX ?? "" }));
    }
    if (!inputs.y && storedData?.lastInputY) {
      setInputs((prev) => ({ ...prev, y: storedData.lastInputY ?? "" }));
    }
  }, [storedData, selectedPoolProcess, inputs.x, inputs.y]);

  const poolsQuery = useQuery<Pool[]>({
    queryKey: ["permaswap-pools"],
    queryFn: async () => {
      const response = await fetch(
        "https://api-ffpscan.permaswap.network/pools"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pools");
      }
      return (await response.json()) as Pool[];
    },
    refetchInterval: REFETCH_INTERVAL,
    staleTime: REFETCH_INTERVAL,
  });

  const isLoading = poolsQuery.isLoading;
  const isFetching = poolsQuery.isFetching;
  const hasError = poolsQuery.isError;
  const pools = useMemo(() => poolsQuery.data ?? [], [poolsQuery.data]);

  const filteredPools = useMemo(() => {
    if (!searchTerm.trim()) return pools;
    const term = searchTerm.toLowerCase();
    return pools.filter((pool) => {
      const candidates = [
        pool.symbolX,
        pool.symbolY,
        pool.fullNameX,
        pool.fullNameY,
        pool.name,
      ];
      return candidates.some((value) =>
        value ? value.toLowerCase().includes(term) : false
      );
    });
  }, [pools, searchTerm]);

  const selectedPool = useMemo(() => {
    if (!selectedPoolProcess) return undefined;
    return pools.find((pool) => pool.process === selectedPoolProcess);
  }, [pools, selectedPoolProcess]);

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

  useEffect(() => {
    if (hasError) {
      setError(true);
      return;
    }

    if (isEdit && !selectedPoolProcess) {
      setError(true);
      return;
    }

    setError(false);
  }, [hasError, isEdit, selectedPoolProcess, setError]);

  useEffect(() => {
    if (!isEdit && selectedPool) {
      updateBlockData(uuid, {
        poolProcess: selectedPool.process,
        poolName: selectedPool.name,
        lastInputX: inputs.x,
        lastInputY: inputs.y,
      });
    }
  }, [isEdit, selectedPool, updateBlockData, uuid, inputs.x, inputs.y]);

  const formatAmount = (amount: number, maxDecimals = 8) => {
    if (!Number.isFinite(amount)) return "";
    if (amount === 0) return "0";
    const decimals = Math.min(Math.max(maxDecimals, 2), 8);
    return amount.toLocaleString(undefined, {
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

  const handleInputChange = (field: SwapInputKey, rawValue: string) => {
    setLastEdited(field);
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
        setCalculationError("Pool price data unavailable");
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
        setCalculationError("Unable to calculate swap amount");
        return next;
      }

      const decimals =
        otherField === "x"
          ? (selectedPool.decimalX ?? 6)
          : (selectedPool.decimalY ?? 6);
      next[otherField] = formatAmount(computed, decimals);
      setCalculationError(null);
      return next;
    });
  };

  const handlePoolSelect = (process: string) => {
    setSelectedPoolProcess(process);
    setSearchTerm("");
    setInputs({ x: "", y: "" });
    setCalculationError(null);
    onExitEdit?.();
  };

  const getStatusBadge = (status: PoolStatus) => {
    const normalized = (status ?? "normal").toLowerCase();
    if (normalized === "certified") {
      return (
        <Badge variant="outline" className="border-blue-500/50 text-blue-500">
          🔵 Certified
        </Badge>
      );
    }
    if (normalized === "evil") {
      return (
        <Badge variant="outline" className="border-red-500/50 text-red-500">
          🔴 Evil
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-green-500/50 text-green-500">
        🟢 Normal
      </Badge>
    );
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
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40"
        style={{ height: size, width: size }}
      >
        <span className="text-sm font-semibold text-primary">
          {symbol?.slice(0, 2) || "?"}
        </span>
      </div>
    );
  };

  const renderTokenInput = (field: SwapInputKey) => {
    if (!selectedPool) return null;
    const symbol = field === "x" ? selectedPool.symbolX : selectedPool.symbolY;
    const fullName =
      field === "x" ? selectedPool.fullNameX : selectedPool.fullNameY;
    const logo = field === "x" ? selectedPool.logoX : selectedPool.logoY;
    const isEditable = selectedPool.reverseSymbol || field === "x";
    const value = inputs[field];
    const price = field === "x" ? priceX : priceY;

    return (
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          {renderLogo(logo, symbol, 40)}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{symbol || "-"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {fullName || "Unnamed token"}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Amount
          </Label>
          <Input
            value={value}
            onChange={(event) =>
              isEditable && handleInputChange(field, event.target.value)
            }
            placeholder="0.0"
            inputMode="decimal"
            disabled={!isEditable || !selectedPool || isFetching}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>USD Price</span>
          <span>{price > 0 ? `$${formatAmount(price, 4)}` : "—"}</span>
        </div>
      </div>
    );
  };

  const canTrade = () => {
    if (!selectedPool || !pricesAvailable || isFetching) {
      toast.error("Cannot trade: pool not selected or prices unavailable.");
      return false;
    }
    if (calculationError) {
      toast.error(`Cannot trade: ${calculationError}`);
      return false;
    }
    if (!selectedPool.accessible) {
      toast.error("Cannot trade: selected pool is restricted.");
      return false;
    }
    if (selectedPool.poolStatus === "evil") {
      toast.error("Cannot trade: selected pool is marked as evil.");
      return false;
    }
    const activeValue = inputs[lastEdited];
    const numeric = Number(activeValue);
    window
      .open(
        `https://www.permaswap.network/#/ao/${selectedPool.x}%26${selectedPool.y}`,
        "_blank"
      )
      ?.focus();
    return !!activeValue && !Number.isNaN(numeric) && numeric > 0;
  };

  const renderSwapInterface = () => {
    if (!selectedPool) {
      return (
        <div className="space-y-2 rounded-lg border border-dashed bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium">No pool selected yet</p>
          <p className="text-xs text-muted-foreground">
            Switch to edit mode to choose a pool and configure this swap block.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Process ID
            </p>
            <p className="break-all font-mono text-sm">
              {selectedPool.process}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(selectedPool.poolStatus)}
            <Badge variant="outline" className="border-muted-foreground/30">
              Fee: {selectedPool.fee} bps
            </Badge>
            {!selectedPool.accessible && (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-500"
              >
                Restricted
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {renderTokenInput("x")}
          {renderTokenInput("y")}
        </div>

        {calculationError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{calculationError}</span>
          </div>
        ) : (
          <div className="space-y-1 rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <p>Estimates refresh with the latest USD pricing every minute.</p>
            {pricesAvailable && (
              <>
                <p>
                  1 {selectedPool.symbolX} ≈ {formatAmount(priceX / priceY, 6)}{" "}
                  {selectedPool.symbolY}
                </p>
                <p>
                  1 {selectedPool.symbolY} ≈ {formatAmount(priceY / priceX, 6)}{" "}
                  {selectedPool.symbolX}
                </p>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Pool: {selectedPool.name}</span>
          <span>
            Mode:{" "}
            {selectedPool.reverseSymbol
              ? "Bidirectional"
              : `${selectedPool.symbolX} → ${selectedPool.symbolY}`}
          </span>
        </div>

        <Button className="w-full" onClick={() => canTrade()}>
          Swap
        </Button>
      </div>
    );
  };

  const renderEditMode = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Select Pool
        </Label>
        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Refreshing…</span>
          </div>
        )}
      </div>

      <Select
        value={selectedPoolProcess || ""}
        onValueChange={handlePoolSelect}
        disabled={isFetching || hasError}
      >
        <SelectTrigger size="lg" className="w-full">
          <SelectValue className="sr-only" />
          {selectedPool ? (
            <div className="flex flex-1 items-center gap-3 overflow-hidden text-left">
              {/* <div className="flex items-center gap-1.5">
                {renderLogo(selectedPool.logoX, selectedPool.symbolX, 26)}
                {renderLogo(selectedPool.logoY, selectedPool.symbolY, 26)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedPool.symbolX} / {selectedPool.symbolY}
                </p>
                <p className="truncate text-[11px] font-mono text-muted-foreground">
                  {selectedPool.process}
                </p>
              </div> */}
            </div>
          ) : (
            <span className="flex-1 truncate text-sm text-muted-foreground">
              Search pools…
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div
            className="p-2 pb-1"
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by symbol or token name"
              className="h-8"
              disabled={isFetching}
            />
          </div>
          {filteredPools.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No pools match your search.
            </div>
          ) : (
            filteredPools.map((pool) => (
              <SelectItem
                key={pool.process}
                value={pool.process}
                className="py-2"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {renderLogo(pool.logoX, pool.symbolX, 28)}
                    {renderLogo(pool.logoY, pool.symbolY, 28)}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {pool.symbolX} / {pool.symbolY}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground font-mono">
                        {pool.process}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {getStatusBadge(pool.poolStatus)}
                    <span>{pool.accessible ? "Accessible" : "Restricted"}</span>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <p className="text-xs text-muted-foreground">
        Picking a pool saves it and exits edit mode automatically.
      </p>

      {selectedPool && (
        <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Current selection</p>
          <p>
            {selectedPool.symbolX} / {selectedPool.symbolY}
          </p>
          <p className="font-mono break-all">{selectedPool.process}</p>
        </div>
      )}
    </div>
  );

  const renderLoading = () => (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">Fetching pool data…</p>
          <p className="text-xs text-muted-foreground">
            This block refreshes automatically every minute.
          </p>
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  const renderError = () => (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <div>
        <p className="text-sm font-semibold text-destructive">
          Unable to load pools
        </p>
        <p className="text-xs text-destructive/80">
          Check your connection and try again later.
        </p>
      </div>
    </div>
  );

  const interactionStateClass =
    isFetching && !isLoading ? "pointer-events-none opacity-60" : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Permaswap Token Swap</h3>
        <Badge variant="outline" className="border-primary/40 text-primary">
          Auto refresh every 1 min
        </Badge>
      </div>

      <div className="relative rounded-xl border bg-muted/10 p-5">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Refreshing pool data…
            </p>
            <p className="text-xs text-muted-foreground">
              Inputs are disabled until the latest data arrives.
            </p>
          </div>
        )}

        <div className={`space-y-4 ${interactionStateClass}`}>
          {hasError
            ? renderError()
            : isLoading
              ? renderLoading()
              : isEdit
                ? renderEditMode()
                : renderSwapInterface()}
        </div>
      </div>
    </div>
  );
}

export default BlockForTokenSwap;
