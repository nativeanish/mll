import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../theme/ThemeProvider";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { useEffect } from "react";
import useWallet from "@/store/useWallet";
import { syncWalletKeyCookiesForAddress } from "@/utils/wallet/fetch-wallet-key";
export const Route = createRootRoute({
  component: () => {
    return <App />;
  },
});
export default function App() {
  const { status, address } = useWallet();

  useEffect(() => {
    if (status === "connected" && address) {
      syncWalletKeyCookiesForAddress(address);
    }
  }, [address, status]);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster position="top-center" richColors />
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </>
  );
}
