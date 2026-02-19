import Login from "@/Blocks/Common/Login";
import { createLazyFileRoute } from "@tanstack/react-router";
import useWallet from "@/store/useWallet";
import WalletGeneration from "@/Page/WalletGeneration";

export const Route = createLazyFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  const { status, address, type } = useWallet();
  if (
    status === "connected" &&
    address &&
    address.length > 0 &&
    type &&
    type.length > 0
  ) {
    return <WalletGeneration />;
  }
  return <Login />;
}
