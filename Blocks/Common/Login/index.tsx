import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import LoginForm from "./login-form";
import { ThemeToggle } from "@/Blocks/Common/ThemeSwitcher";
import { BackgroundDecoration } from "./background-decoration";
import { useEffect, useState } from "react";
import { autoReconnectWallet } from "@/utils/wallet/auto-reconnect";
import useWallet from "@/store/useWallet";
import { Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  fetchAndCacheWalletKey,
  getCachedWalletKey,
  syncWalletKeyCookiesForAddress,
  WalletKeyFetchError,
} from "@/utils/wallet/fetch-wallet-key";

const Login = () => {
  const navigate = useNavigate();
  const [isFetchingKey, setIsFetchingKey] = useState(false);
  const [keyFetchError, setKeyFetchError] = useState<string | null>(null);

  useEffect(() => {
    autoReconnectWallet();
  }, []);

  const { status, address, setEkey } = useWallet();

  useEffect(() => {
    if (status !== "connected" || !address) {
      setIsFetchingKey(false);
      setKeyFetchError(null);
      setEkey(null);
      return;
    }

    let cancelled = false;

    const fetchWalletKey = async () => {
      setEkey(null);
      setKeyFetchError(null);
      syncWalletKeyCookiesForAddress(address);

      const cachedKey = getCachedWalletKey(address);
      if (cachedKey && cachedKey.length > 0) {
        if (!cancelled) {
          setEkey(cachedKey);
        }
        return;
      }

      setIsFetchingKey(true);
      try {
        const decryptedKey = await fetchAndCacheWalletKey(address);
        if (cancelled) {
          return;
        }
        setEkey(decryptedKey);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof WalletKeyFetchError && error.statusCode === 404) {
          const message = "No wallet key found for this address.";
          setKeyFetchError(message);
          toast.error(message);
          void navigate({ to: "/wallet" });
          return;
        }

        setKeyFetchError(
          error instanceof Error
            ? error.message
            : "Failed to fetch and decrypt wallet key",
        );
      } finally {
        if (!cancelled) {
          setIsFetchingKey(false);
        }
      }
    };

    void fetchWalletKey();

    return () => {
      cancelled = true;
    };
  }, [address, navigate, setEkey, status]);

  return (
    <div className="relative flex h-auto min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <span className="font-black text-lg tracking-tight uppercase bg-nb-yellow text-black px-2 py-0.5 border-2 border-border rounded-md shadow-[2px_2px_0px_var(--border)] group-hover:shadow-[3px_3px_0px_var(--border)] group-hover:-translate-x-px group-hover:-translate-y-px transition-all duration-150">
          <span className="sm:hidden">M</span>
          <span className="hidden sm:inline">metalinks</span>
        </span>
        <ThemeToggle />
      </header>

      <BackgroundDecoration />

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full sm:max-w-md">
          {/* Card */}
          <Card className="border-2 border-border bg-card shadow-[6px_6px_0px_var(--border)] rounded-lg overflow-hidden">
            {/* Accent top bar - neo-brutal style */}
            <div className="h-2 w-full bg-primary border-b-2 border-border" />

            <CardHeader className="space-y-4 px-6 pt-8 pb-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent border-2 border-border shadow-[3px_3px_0px_var(--border)]">
                <Shield className="h-7 w-7 text-accent-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-black tracking-tight uppercase">
                  Connect Your Wallet
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground font-medium max-w-sm mx-auto">
                  Choose your preferred wallet to securely connect and access
                  the platform.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8 pt-2">
              <LoginForm
                isFetchingKey={isFetchingKey}
                keyFetchError={keyFetchError}
              />
              {status === "connected" &&
              address &&
              address.length > 0 ? null : (
                <div className="pt-2">
                  <p className="text-foreground text-center text-xs leading-relaxed font-bold">
                    Don't have a wallet?{" "}
                    <a
                      href="https://ar.io/wallet"
                      target="_blank"
                      className="text-primary font-black underline underline-offset-4 hover:text-primary/80 transition-colors"
                    >
                      Get one here
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer text */}
          <p className="mt-6 text-center text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Secured by Arweave &middot; Your keys, your data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
