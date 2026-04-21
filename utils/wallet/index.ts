import useWallet from "@/store/useWallet";
import { beacon_client } from "./beacon";
import arweave_client from "./arweave";
import { toast } from "sonner";

function clearAllCookies(): void {
  const cookies = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name.length > 0);

  for (const name of cookies) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
  }
}

export const disconnectWallet = async () => {
  try {
    const state = useWallet.getState().type;
    if (!state) {
      return false;
    }
    if (state === "wander") {
      await window.arweaveWallet.disconnect();
    }
    if (state === "beacon") {
      await beacon_client.disconnect();
    }
    if (state === "arweave") {
      await arweave_client.disconnect();
    }
    useWallet.getState().disconnect();
    clearAllCookies();
    return true;
  } catch (error) {
    toast.warning("Failed to disconnect wallet");
    console.error("Failed to disconnect wallet:", error);
    return false;
  }
};
