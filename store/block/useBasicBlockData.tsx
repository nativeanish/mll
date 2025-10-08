import { create } from "zustand";

interface State {
  name: string;
  description: string;
  coverUrl: string | null;
  avatarUrl: string | null;
  setData: (data: Partial<Omit<State, "setData">>) => void;
}

const useBasicBlockData = create<State>((set) => ({
  name: "",
  description: "",
  coverUrl: null,
  avatarUrl: null,
  setData: (data) => set((state) => ({ ...state, ...data })),
}));

export default useBasicBlockData;
