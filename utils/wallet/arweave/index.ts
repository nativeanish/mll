import useWallet from "@/store/useWallet";
import { ArweaveWebWallet } from "arweave-wallet-connector";

export const arweave_client = new ArweaveWebWallet({
  name: "Metalinks",
  logo: "https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg",
});

arweave_client.setUrl("arweave.app");
export default arweave_client;
export const checkConnectionArweave = async () => {
  try {
    const address = await arweave_client.address;
    if (address && address.length) {
      console.log("Connected to Arweave with address:", address);
      useWallet.getState().setType("arweave");
      useWallet.getState().setAddress(address);
      useWallet.getState().setStatus("connected");
      useWallet.getState().saveToStorage();
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};
export const connectArweave = async () => {
  try {
    useWallet.getState().connect("arweave");
    await arweave_client.connect();
    const success = await checkConnectionArweave();

    if (!success) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError("Failed to connect to Arweave");
    }

    return success;
  } catch (e) {
    console.log(e);
    useWallet.getState().setStatus("error");
    useWallet.getState().setError("Failed to connect to Arweave");
    return false;
  }
};
