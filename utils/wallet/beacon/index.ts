import useWallet from "@/store/useWallet";
import WalletClient from "@vela-ventures/ao-sync-sdk";
export const beacon_client = new WalletClient();
export const checkConnectionBeacon = async () => {
  try {
    await beacon_client.connect({
      permissions: ["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGN_TRANSACTION"],
      appInfo: {
        name: "Metalinks",
        logo: "https://arweave.net/wIY5VdJXUCezPY8fRrCL6aNfGt4P1XvwPFJLCJV2cEQ",
      },
      gateway: {
        host: "arweave.net",
        port: 443,
        protocol: "https",
      },
      brokerUrl: "wss://aosync-broker-eu.beaconwallet.dev:8081",
      options: {
        protocolVersion: 5,
      },
    });
    const address = await beacon_client.getActiveAddress();
    if (!address || !address.length) {
      return false;
    }
    useWallet.getState().setType("beacon");
    useWallet.getState().setAddress(address);
    useWallet.getState().setStatus("connected");
    // useWallet.getState().saveToStorage();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
export const connectBeacon = async () => {
  try {
    useWallet.getState().connect("beacon");

    await beacon_client.connect({
      permissions: ["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGN_TRANSACTION"],
      appInfo: {
        name: "Metalinks",
        logo: "https://arweave.net/wIY5VdJXUCezPY8fRrCL6aNfGt4P1XvwPFJLCJV2cEQ",
      },
      gateway: {
        host: "arweave.net",
        port: 443,
        protocol: "https",
      },
      brokerUrl: "wss://aosync-broker-eu.beaconwallet.dev:8081",
      options: {
        protocolVersion: 5,
      },
    });
    const success = await checkConnectionBeacon();

    if (!success) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError("Failed to connect to Beacon");
    }

    return success;
  } catch (e) {
    console.log(e);
    useWallet.getState().setStatus("error");
    useWallet.getState().setError("Failed to connect to Beacon");
    return false;
  }
};
