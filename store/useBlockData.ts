import { create } from "zustand";

interface BasicBlockData {
  name: string;
  description: string;
  coverUrl: string | null;
  avatarUrl: string | null;
}
interface State extends BasicBlockData {
  setData: (data: Partial<BasicBlockData>) => void;
}

const useBlockData = create<State>((set) => ({
  name: "",
  description: "",
  coverUrl: null,
  avatarUrl: null,
  setData: (data) => set((state) => ({ ...state, ...data })),
}));
export default useBlockData;
