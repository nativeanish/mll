import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Input } from "@/src/components/ui/input";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}

interface Token {
  process: string;
  decimals: number;
  symbol: string;
  fullName: string;
  logo: string;
  totalSupply: string;
  price: string;
  status: "certified" | "normal" | "unavailable" | "evil";
  tokenAccessible: boolean;
}

interface Pool {
  process: string;
  x: string;
  y: string;
  symbolX: string;
  symbolY: string;
  tradeCount24H: number;
  volumeLast24H: string;
  volumeLast7Days: string;
  accessible: boolean;
}

interface AggregatedStats {
  totalTrades24H: number;
  totalVolume24H: number;
  totalVolume7D: number;
  poolCount: number;
}

const REFETCH_INTERVAL = 10 * 60 * 1000;

function BlockForTokenInfo({ isEdit, setError }: Props) {
  const [selectedTokenProcess, setSelectedTokenProcess] = useState<
    string | null
  >(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");

  const tokensQuery = useQuery({
    queryKey: ["permaswap-tokens"],
    queryFn: async () => {
      const response = await fetch(
        "https://api-ffpscan.permaswap.network/tokenList"
      );
      if (!response.ok) throw new Error("Failed to fetch tokens");
      return response.json() as Promise<Token[]>;
    },
    refetchInterval: REFETCH_INTERVAL,
    staleTime: REFETCH_INTERVAL,
  });

  const poolsQuery = useQuery({
    queryKey: ["permaswap-pools"],
    queryFn: async () => {
      const response = await fetch(
        "https://api-ffpscan.permaswap.network/pools"
      );
      if (!response.ok) throw new Error("Failed to fetch pools");
      return response.json() as Promise<Pool[]>;
    },
    refetchInterval: REFETCH_INTERVAL,
    staleTime: REFETCH_INTERVAL,
    enabled: !!selectedTokenProcess,
  });

  useEffect(() => {
    if (tokensQuery.dataUpdatedAt || poolsQuery.dataUpdatedAt) {
      setLastUpdated(new Date());
    }
  }, [tokensQuery.dataUpdatedAt, poolsQuery.dataUpdatedAt]);

  useEffect(() => {
    const hasError =
      tokensQuery.isError || (!!selectedTokenProcess && poolsQuery.isError);
    setError(hasError);
  }, [tokensQuery.isError, poolsQuery.isError, selectedTokenProcess, setError]);

  const selectedToken = useMemo(() => {
    if (!selectedTokenProcess || !tokensQuery.data) return null;
    return (
      tokensQuery.data.find((t) => t.process === selectedTokenProcess) || null
    );
  }, [selectedTokenProcess, tokensQuery.data]);

  const filteredTokens = useMemo(() => {
    if (!tokensQuery.data) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tokensQuery.data;

    return tokensQuery.data.filter((token) => {
      const symbolMatch = token.symbol?.toLowerCase().includes(term);
      const nameMatch = token.fullName?.toLowerCase().includes(term);
      const logoMatch = token.logo?.toLowerCase().includes(term);
      return symbolMatch || nameMatch || logoMatch;
    });
  }, [tokensQuery.data, searchTerm]);

  const aggregatedStats = useMemo<AggregatedStats | null>(() => {
    if (!selectedTokenProcess || !poolsQuery.data) return null;

    const relevantPools = poolsQuery.data.filter(
      (pool) =>
        pool.x === selectedTokenProcess || pool.y === selectedTokenProcess
    );

    const stats = relevantPools.reduce(
      (acc, pool) => {
        acc.totalTrades24H += pool.tradeCount24H || 0;
        acc.totalVolume24H += parseFloat(pool.volumeLast24H || "0");
        acc.totalVolume7D += parseFloat(pool.volumeLast7Days || "0");
        return acc;
      },
      {
        totalTrades24H: 0,
        totalVolume24H: 0,
        totalVolume7D: 0,
        poolCount: relevantPools.length,
      }
    );

    return stats;
  }, [selectedTokenProcess, poolsQuery.data]);

  const getStatusIcon = (status: Token["status"]) => {
    switch (status) {
      case "certified":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "normal":
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case "unavailable":
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
      case "evil":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Token["status"]) => {
    const variants = {
      certified: {
        label: "Certified",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
      normal: {
        label: "Normal",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
      },
      unavailable: {
        label: "Unavailable",
        className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      },
      evil: {
        label: "Warning",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
      },
    };

    const variant = variants[status];
    return (
      <Badge variant="outline" className={variant.className}>
        {getStatusIcon(status)}
        <span className="ml-1">{variant.label}</span>
      </Badge>
    );
  };

  const formatNumber = (
    value: number | string,
    decimals: number = 2
  ): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";

    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatSupply = (supply: string, decimals: number): string => {
    const num = parseFloat(supply);
    if (isNaN(num)) return "0";
    const adjusted = num / Math.pow(10, decimals);
    return formatNumber(adjusted);
  };

  if (isEdit) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Select Token</h3>
            {tokensQuery.isFetching && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {tokensQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : tokensQuery.isError ? (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Failed to Load Tokens
                </p>
                <p className="text-xs text-muted-foreground">
                  Unable to fetch token list from Permaswap
                </p>
              </div>
            </div>
          ) : (
            <>
              <Select
                value={selectedTokenProcess || ""}
                onValueChange={(value) => {
                  setSelectedTokenProcess(value);
                  setSearchTerm("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a token..." />
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
                      placeholder="Search by name or logo..."
                      className="h-8"
                    />
                  </div>
                  {filteredTokens.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No tokens match your search.
                    </div>
                  ) : (
                    filteredTokens.map((token) => (
                      <SelectItem
                        key={token.process}
                        value={token.process}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {token.logo ? (
                            <img
                              src={`https://arweave.net/${token.logo}`}
                              alt={token.symbol}
                              className="h-5 w-5 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {token.symbol[0]}
                              </span>
                            </div>
                          )}
                          <span className="font-medium">{token.symbol}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {token.fullName}
                          </span>
                          {getStatusIcon(token.status)}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedTokenProcess && (
                <p className="text-xs text-muted-foreground">
                  Token selected. Preview below to see aggregated stats.
                </p>
              )}
            </>
          )}
        </div>

        {selectedToken && (
          <div className="p-4 bg-muted/30 rounded-lg border border-muted">
            <div className="flex items-start gap-3">
              {selectedToken.logo ? (
                <img
                  src={`https://arweave.net/${selectedToken.logo}`}
                  alt={selectedToken.symbol}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedToken.symbol[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{selectedToken.symbol}</h4>
                  {getStatusBadge(selectedToken.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedToken.fullName}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!selectedToken) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          No Token Selected
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Select a token to view trading information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-background border border-primary/20 p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            {selectedToken.logo ? (
              <img
                src={`https://arweave.net/${selectedToken.logo}`}
                alt={selectedToken.symbol}
                className="h-16 w-16 rounded-full object-cover border-2 border-background shadow-lg"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/70 flex items-center justify-center border-2 border-background shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">
                  {selectedToken.symbol[0]}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              {getStatusIcon(selectedToken.status)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">
                  {selectedToken.symbol}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {selectedToken.fullName}
                </p>
              </div>
              {getStatusBadge(selectedToken.status)}
            </div>

            {selectedToken.price && parseFloat(selectedToken.price) > 0 && (
              <div className="mt-2">
                <p className="text-2xl font-bold text-primary">
                  ${parseFloat(selectedToken.price).toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground">Current Price</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-muted">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Decimals
            </span>
          </div>
          <p className="text-lg font-bold">{selectedToken.decimals}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-muted">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-primary/10">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Total Supply
            </span>
          </div>
          <p className="text-lg font-bold">
            {formatSupply(selectedToken.totalSupply, selectedToken.decimals)}
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/30 border border-muted">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary -mt-1" />
          </div>
          <span className="text-xs font-medium">Token Status</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            {selectedToken.tokenAccessible
              ? "Trading Active"
              : "Trading Paused"}
          </span>
          <Badge
            variant={selectedToken.tokenAccessible ? "default" : "secondary"}
            className="text-xs"
          >
            {selectedToken.tokenAccessible ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      {poolsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : poolsQuery.isError ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to Load Pool Data
              </p>
              <p className="text-xs text-muted-foreground">
                Unable to fetch trading statistics
              </p>
            </div>
          </div>
        </div>
      ) : aggregatedStats ? (
        <>
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Aggregated Pool Statistics
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      24H Trade Count
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatNumber(aggregatedStats.totalTrades24H, 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      24H Volume
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${formatNumber(aggregatedStats.totalVolume24H)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      7D Volume
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${formatNumber(aggregatedStats.totalVolume7D)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>Active in {aggregatedStats.poolCount} pools</span>
            </div>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-between pt-2 border-t border-muted">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="p-2 rounded-md bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          Data refreshes automatically every 10 minutes
        </p>
      </div>
    </div>
  );
}

export default BlockForTokenInfo;
