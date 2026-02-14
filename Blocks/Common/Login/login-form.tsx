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
      <div className="flex flex-col items-center justify-center space-y-5 py-14">
        <div className="rounded-lg bg-accent border-2 border-border p-4 shadow-[3px_3px_0px_var(--border)]">
          <Loader2 className="h-8 w-8 animate-spin text-accent-foreground" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-black uppercase tracking-wide">
            Connecting to {type}...
          </p>
          <p className="text-xs text-muted-foreground font-bold">
            Please approve the connection in your wallet
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-5 py-14">
        <div className="rounded-lg bg-destructive/20 border-2 border-border p-4 shadow-[3px_3px_0px_var(--border)]">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-black text-destructive uppercase tracking-wide">
            Connection Failed
          </p>
          <p className="text-xs text-muted-foreground font-bold max-w-xs">
            {error || "Failed to connect to wallet"}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-accent border-2 border-border px-4 py-1.5 shadow-[2px_2px_0px_var(--border)]">
          <div className="h-2 w-2 rounded-sm bg-nb-orange border border-border animate-pulse" />
          <p className="text-xs text-foreground font-black uppercase">
            Retrying in {countdown > 0 ? countdown : 0}s
          </p>
        </div>
      </div>
    );
  }

  if (status === "connected" && address) {
    return (
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className="rounded-lg bg-nb-mint border-2 border-border p-4 shadow-[3px_3px_0px_var(--border)]">
          <CheckCircle2 className="h-8 w-8 text-foreground" />
        </div>
        <p className="text-base font-black text-foreground uppercase tracking-wide">
          Wallet Connected
        </p>

        <div className="w-full rounded-lg bg-card border-2 border-border overflow-hidden shadow-[3px_3px_0px_var(--border)]">
          {/* Wallet type row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-border bg-muted">
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black">
                Wallet
              </p>
              <p className="text-sm font-bold capitalize">{type}</p>
            </div>
            <div className="shrink-0 h-2 w-2 rounded-sm bg-nb-teal border border-border animate-pulse" />
          </div>

          {/* Address row */}
          <div className="px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-black mb-1">
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
          variant="destructive"
          className="w-full h-10 rounded-lg font-black text-sm uppercase tracking-wide"
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
          <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-border bg-accent shadow-[1px_1px_0px_var(--border)]">
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
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Arweave Wallets
          </h3>
        </div>

        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-lg border-2 border-border bg-background hover:bg-accent text-sm font-bold shadow-[3px_3px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-[0.5px] hover:-translate-y-[0.5px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all group"
            onClick={() => connectWander()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
                <img
                  src="https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE"
                  className="h-5 w-5"
                  alt="Wander"
                />
              </div>
              <span>Wander</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-lg border-2 border-border bg-background hover:bg-accent text-sm font-bold shadow-[3px_3px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-[0.5px] hover:-translate-y-[0.5px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all group"
            onClick={() => connectBeacon()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
                <img
                  src="https://arweave.net/E-oGpzqQF0N_vw-t3hokpefxj_Ka_fBee_hZ2cK6vIo"
                  className="h-5 w-5"
                  alt="Beacon"
                />
              </div>
              <span>Beacon</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-lg border-2 border-border bg-background hover:bg-accent text-sm font-bold shadow-[3px_3px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-[0.5px] hover:-translate-y-[0.5px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all group"
            onClick={() => connectArweave()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
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
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground font-black uppercase">
            or
          </span>
        </div>
      </div>

      {/* Ethereum Wallets Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm border-2 border-border bg-accent shadow-[1px_1px_0px_var(--border)]">
            <img
              src="https://arweave.net/tfIJEwmbqiBBoyjwOTvZvrDbAuyAVI7TTjtd4PQkg34"
              className="h-4 w-4"
              alt="Ethereum"
            />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Ethereum Wallets
          </h3>
        </div>

        <div className="space-y-1.5">
          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-lg border-2 border-border bg-background hover:bg-accent text-sm font-bold shadow-[3px_3px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-[0.5px] hover:-translate-y-[0.5px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all group"
            onClick={() => connectMetaMask()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
                <img
                  src="https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo"
                  className="h-5 w-5"
                  alt="MetaMask"
                />
              </div>
              <span>MetaMask</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
