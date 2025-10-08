import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/src/components/ui/button";
import useWallet from "@/store/useWallet";
import { disconnectWallet } from "@/utils/wallet";
import { connectArweave } from "@/utils/wallet/arweave";
import { connectBeacon } from "@/utils/wallet/beacon";
import { connectMetaMask } from "@/utils/wallet/metamask";
import { connectWander } from "@/utils/wallet/wander";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const LoginForm = () => {
  const { theme } = useTheme();
  const { status, type, address, error, setStatus } = useWallet();

  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (status === "error") {
      // reset to 3 when an error begins
      setCountdown(3);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // when it reaches 0/1, clear and put UI back to idle
            setStatus("idle");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    // keep countdown reset when not in error state
    setCountdown(3);
  }, [status, setStatus]);

  if (status === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 animate-fadeIn">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Connecting to {type}...</p>
        <p className="text-sm text-muted-foreground">
          Please approve the connection in your wallet
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 animate-fadeIn">
        <div className="rounded-full bg-destructive/10 p-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <p className="text-lg font-medium text-destructive">
          Connection Failed
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {error || "Failed to connect to wallet"}
        </p>
        <p className="text-xs text-muted-foreground">
          Retrying in {countdown > 0 ? countdown : 0} second
          {countdown === 1 ? "" : "s"}...
        </p>
      </div>
    );
  }

  if (status === "connected" && address) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-fadeIn">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-lg font-medium text-green-500">Wallet Connected</p>
        <div className="rounded-lg bg-secondary p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Wallet Type</p>
          <div className="flex gap-x-2">
            {type === "arweave" &&
              (theme === "dark" ? (
                <img
                  src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                  className="h-7 w-7"
                  alt="Arweave"
                />
              ) : (
                <img
                  src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                  className="h-7 w-7"
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
            <span className="capitalize">{type}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Address</p>
          <p className="font-mono text-sm break-all">{address}</p>
          <div className="flex justify-center mt-4">
            <Button
              variant="destructive"
              className="h-10"
              onClick={() => disconnectWallet()}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <div className="text-primary">
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
          </div>
          <h3 className="font-semibold">Arweave Wallet</h3>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground bg-transparent"
            onClick={() => connectWander()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <img
                src="https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE"
                className="h-7 w-7"
                alt="Wander"
              />
            </div>
            Connect with Wander
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground bg-transparent"
            onClick={() => connectBeacon()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <img
                src="https://arweave.net/E-oGpzqQF0N_vw-t3hokpefxj_Ka_fBee_hZ2cK6vIo"
                className="h-7 w-7"
                alt="Beacon"
              />
            </div>
            Connect with Beacon
          </Button>

          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground bg-transparent"
            onClick={() => connectArweave()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              {theme === "dark" ? (
                <img
                  src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                  className="h-7 w-7"
                  alt="Arweave"
                />
              ) : (
                <img
                  src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                  className="h-7 w-7"
                  alt="Arweave"
                />
              )}
            </div>
            Connect with Arweave.app
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <div className="text-primary">
              <img
                src="https://arweave.net/tfIJEwmbqiBBoyjwOTvZvrDbAuyAVI7TTjtd4PQkg34"
                className="h-5 w-5"
                alt="Ethereum"
              />
            </div>
          </div>
          <h3 className="font-semibold">Ethereum Wallet</h3>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground bg-transparent"
            onClick={() => connectMetaMask()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <img
                src="https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo"
                className="h-7 w-7"
                alt="MetaMask"
              />
            </div>
            Connect with MetaMask
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
