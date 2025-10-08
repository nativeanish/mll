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

const Login = () => {
  useEffect(() => {
    autoReconnectWallet();
  }, []);
  const { status, address } = useWallet();

  return (
    <div className="relative flex h-auto min-h-screen flex-col overflow-x-hidden">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
        <Logo className="gap-3" />
        <ThemeToggle />
      </header>

      <BackgroundDecoration />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full border shadow-lg sm:max-w-lg">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-balance text-3xl font-semibold tracking-tight">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-pretty text-base leading-relaxed">
                Choose your preferred wallet to securely connect and access the
                platform.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <LoginForm />
            {status === "connected" && address && address.length > 0 ? null : (
              <p className="text-muted-foreground text-balance text-center text-sm leading-relaxed">
                Don't have a Wallet ?{" "}
                <a
                  href="https://ar.io/wallet"
                  target="_blank"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Get one here
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
