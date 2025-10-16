import Login from "@/Blocks/Common/Login";
import { createLazyFileRoute } from "@tanstack/react-router";
import Studio from "@/Page/Studio";
import useWallet from "@/store/useWallet";

export const Route = createLazyFileRoute("/")({
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
    return <Studio />;
  }
  return <Login />;
}
