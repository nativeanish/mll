import useWallet from "@/store/useWallet";
import { beacon_client } from "./beacon";
import arweave_client from "./arweave";
import { toast } from "sonner";

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
    return true;
  } catch (error) {
    toast.warning("Failed to disconnect wallet");
    console.error("Failed to disconnect wallet:", error);
    return false;
  }
};
