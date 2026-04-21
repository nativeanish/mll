import { create } from "zustand";

export type wallet_type = "metamask" | "arweave" | "wander" | "beacon";
export type connection_status =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

interface WalletStorage {
  wallet: wallet_type | null;
  connection: "Connected" | "Disconnected";
  ekey?: string;
}

interface State {
  type: wallet_type | null;
  status: connection_status;
  address: string | null;
  error: string | null;
  ekey: string | null;
  setType: (type: State["type"]) => void;
  setStatus: (status: connection_status) => void;
  setAddress: (address: string | null) => void;
  setError: (error: string | null) => void;
  setEkey: (ekey: string | null) => void;
  connect: (type: wallet_type) => void;
  disconnect: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => wallet_type | null;
}

const STORAGE_KEY = "wallet_connection";

const useWallet = create<State>((set, get) => ({
  type: null,
  status: "idle",
  address: null,
  error: null,

  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  setAddress: (address) => set({ address }),
  setError: (error) => set({ error }),

  connect: (type) => {
    set({ type, status: "connecting", error: null });
  },
  ekey: null,
  setEkey: (ekey) => set({ ekey }),

  disconnect: () => {
    set({
      type: null,
      status: "disconnected",
      address: null,
      error: null,
      ekey: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  },

  saveToStorage: () => {
    const { type, status } = get();
    if (type && status === "connected") {
      const data: WalletStorage = {
        wallet: type,
        connection: "Connected",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: WalletStorage = JSON.parse(stored);
        if (data.wallet && data.connection === "Connected") {
          return data.wallet;
        }
      }
    } catch (error) {
      console.error("Failed to load wallet from storage:", error);
    }
    return null;
  },
}));

export default useWallet;
