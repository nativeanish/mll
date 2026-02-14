import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import Logo from "./Logo";
import LoginForm from "./login-form";
import { ThemeToggle } from "@/Blocks/Common/ThemeSwitcher";
import { BackgroundDecoration } from "./background-decoration";
import { useEffect } from "react";
import { autoReconnectWallet } from "@/utils/wallet/auto-reconnect";
import useWallet from "@/store/useWallet";
import { Shield } from "lucide-react";

const Login = () => {
  useEffect(() => {
    autoReconnectWallet();
  }, []);
  const { status, address } = useWallet();

  return (
    <div className="relative flex h-auto min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <Logo className="gap-2.5" />
        <ThemeToggle />
      </header>

      <BackgroundDecoration />

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full sm:max-w-md">
          {/* Card */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 rounded-2xl overflow-hidden">
            {/* Accent top bar */}
            <div className="h-1 w-full bg-linear-to-r from-violet-500 via-indigo-500 to-purple-500" />

            <CardHeader className="space-y-4 px-6 pt-8 pb-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Connect Your Wallet
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground/80 max-w-sm mx-auto">
                  Choose your preferred wallet to securely connect and access
                  the platform.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8 pt-2">
              <LoginForm />
              {status === "connected" &&
              address &&
              address.length > 0 ? null : (
                <div className="pt-2">
                  <p className="text-muted-foreground/60 text-center text-xs leading-relaxed">
                    Don't have a wallet?{" "}
                    <a
                      href="https://ar.io/wallet"
                      target="_blank"
                      className="text-foreground/80 font-medium underline-offset-4 hover:underline transition-colors hover:text-foreground"
                    >
                      Get one here
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer text */}
          <p className="mt-6 text-center text-[11px] text-muted-foreground/40">
            Secured by Arweave &middot; Your keys, your data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
