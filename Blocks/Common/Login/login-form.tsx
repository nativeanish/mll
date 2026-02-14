import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/src/components/ui/button";
import useWallet from "@/store/useWallet";
import { disconnectWallet } from "@/utils/wallet";
import { connectArweave } from "@/utils/wallet/arweave";
import { connectBeacon } from "@/utils/wallet/beacon";
import { connectMetaMask } from "@/utils/wallet/metamask";
import { connectWander } from "@/utils/wallet/wander";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const { theme } = useTheme();
  const { status, type, address, error, setStatus } = useWallet();

  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (status === "error") {
      setCountdown(3);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStatus("idle");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    setCountdown(3);
  }, [status, setStatus]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  if (status === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 py-14 animate-fadeIn">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative rounded-full bg-primary/5 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-semibold">Connecting to {type}...</p>
          <p className="text-xs text-muted-foreground/70">
            Please approve the connection in your wallet
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 py-14 animate-fadeIn">
        <div className="rounded-2xl bg-destructive/10 p-4 ring-1 ring-destructive/20">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-semibold text-destructive">
            Connection Failed
          </p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">
            {error || "Failed to connect to wallet"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs text-muted-foreground font-medium">
            Retrying in {countdown > 0 ? countdown : 0}s
          </p>
        </div>
      </div>
    );
  }

  if (status === "connected" && address) {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 animate-fadeIn">
        <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
          Wallet Connected
        </p>

        <div className="w-full rounded-xl bg-muted/30 ring-1 ring-border/50 overflow-hidden">
          {/* Wallet type row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
            <div className="shrink-0">
              {type === "arweave" &&
                (theme === "dark" ? (
                  <img
                    src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                    className="h-6 w-6"
                    alt="Arweave"
                  />
                ) : (
                  <img
                    src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                    className="h-6 w-6"
                    alt="Arweave"
                  />
                ))}
              {type === "wander" && (
                <img
                  src="https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE"
                  className="h-6 w-6"
                  alt="Wander"
                />
              )}
              {type === "beacon" && (
                <img
                  src="https://arweave.net/E-oGpzqQF0N_vw-t3hokpefxj_Ka_fBee_hZ2cK6vIo"
                  className="h-6 w-6"
                  alt="Beacon"
                />
              )}
              {type === "metamask" && (
                <img
                  src="https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo"
                  className="h-6 w-6"
                  alt="MetaMask"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                Wallet
              </p>
              <p className="text-sm font-medium capitalize">{type}</p>
            </div>
            <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Address row */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1">
              Address
            </p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-foreground/80 break-all flex-1 leading-relaxed">
                {address}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
                onClick={copyAddress}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all font-medium text-sm"
          onClick={() => disconnectWallet()}
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Arweave Wallets Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-6 w-6 items-center justify-center">
            {theme === "dark" ? (
              <img
                src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                className="h-4 w-4"
                alt="Arweave"
              />
            ) : (
              <img
                src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                className="h-4 w-4"
                alt="Arweave"
              />
            )}
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Arweave Wallets
          </h3>
        </div>

        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-xl border-border/50 bg-transparent hover:bg-muted/50 text-sm font-medium transition-all group"
            onClick={() => connectWander()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30 group-hover:ring-border/50 transition-colors">
                <img
                  src="https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE"
                  className="h-5 w-5"
                  alt="Wander"
                />
              </div>
              <span>Wander</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-xl border-border/50 bg-transparent hover:bg-muted/50 text-sm font-medium transition-all group"
            onClick={() => connectBeacon()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30 group-hover:ring-border/50 transition-colors">
                <img
                  src="https://arweave.net/E-oGpzqQF0N_vw-t3hokpefxj_Ka_fBee_hZ2cK6vIo"
                  className="h-5 w-5"
                  alt="Beacon"
                />
              </div>
              <span>Beacon</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-xl border-border/50 bg-transparent hover:bg-muted/50 text-sm font-medium transition-all group"
            onClick={() => connectArweave()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30 group-hover:ring-border/50 transition-colors">
                {theme === "dark" ? (
                  <img
                    src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                    className="h-5 w-5"
                    alt="Arweave"
                  />
                ) : (
                  <img
                    src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                    className="h-5 w-5"
                    alt="Arweave"
                  />
                )}
              </div>
              <span>Arweave.app</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground/40 font-medium">
            or
          </span>
        </div>
      </div>

      {/* Ethereum Wallets Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-6 w-6 items-center justify-center">
            <img
              src="https://arweave.net/tfIJEwmbqiBBoyjwOTvZvrDbAuyAVI7TTjtd4PQkg34"
              className="h-4 w-4"
              alt="Ethereum"
            />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Ethereum Wallets
          </h3>
        </div>

        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-xl border-border/50 bg-transparent hover:bg-muted/50 text-sm font-medium transition-all group"
            onClick={() => connectMetaMask()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/30 group-hover:ring-border/50 transition-colors">
                <img
                  src="https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo"
                  className="h-5 w-5"
                  alt="MetaMask"
                />
              </div>
              <span>MetaMask</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
