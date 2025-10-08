import useWallet from "@/store/useWallet";
import { checkConnectionMetaMask } from "./metamask";
import { checkConnectionArweave } from "./arweave";
import { checkConnectionWander } from "./wander";
// import { checkConnectionBeacon } from "./beacon";

export const autoReconnectWallet = async () => {
  const storedWallet = useWallet.getState().loadFromStorage();

  if (!storedWallet) {
    return false;
  }

  const state = useWallet.getState();
  state.connect(storedWallet);

  try {
    let success = false;

    switch (storedWallet) {
      case "metamask":
        success = await checkConnectionMetaMask();
        break;
      case "arweave":
        success = await checkConnectionArweave();
        break;
      case "wander":
        success = await checkConnectionWander();
        break;
      // case "beacon":
      //   success = await checkConnectionBeacon();
      //   break;
      default:
        success = false;
    }

    if (!success) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError(`Failed to reconnect to ${storedWallet}`);
      localStorage.removeItem("wallet_connection");
    }

    return success;
  } catch (error) {
    console.error("Auto-reconnect failed:", error);
    useWallet.getState().setStatus("error");
    useWallet.getState().setError("Failed to reconnect wallet");
    localStorage.removeItem("wallet_connection");
    return false;
  }
};
