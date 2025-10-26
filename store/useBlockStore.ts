import { create } from "zustand";
import type { IconType } from "react-icons";
import { node } from "@/utils/block/block";
export interface BasicBlockData {
  name: string;
  description: string;
  coverUrl: string | null;
  avatarUrl: string | null;
}
export interface BlockData {
  id: string;
  alt: string;
  name: string;
  icon: IconType | React.ComponentType;
  display: string[] | string;
  enabled: boolean;
  clicks: number;
  views: number;
  data: Record<string, unknown>;
  placeholder?: string;
  node: (typeof node.nav)[number]["name"];
}
type params = {
  alt: (typeof node.nav)[number]["node"][number]["alt"];
  name: string;
  icon: IconType | React.ComponentType;
  display: string[] | string;
  id: string;
  enabled: boolean;
  clicks: number;
  views: number;
  placeholder: string;
  node: (typeof node.nav)[number]["name"];
};
interface BlockStore extends BasicBlockData {
  setBasicData: (data: Partial<BasicBlockData>) => void;
  blocks: BlockData[];
  addBlock: (params: params) => void;
  removeBlock: (id: string) => void;
  toggleBlock: (id: string) => void;
  updateBlockData: (id: string, data: Record<string, unknown>) => void;
  incrementClicks: (id: string) => void;
  incrementViews: (id: string) => void;
}

export const useBlockStore = create<BlockStore>((set) => ({
  name: "",
  description: "",
  coverUrl: null,
  avatarUrl: null,
  setBasicData: (data) => set((state) => ({ ...state, ...data })),
  blocks: [],
  addBlock: (params) =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: params.id,
          alt: params.alt,
          name: params.name,
          icon: params.icon,
          display: Array.isArray(params.display)
            ? params.display
            : [params.display],
          enabled: true,
          clicks: params.clicks,
          views: params.views,
          data: {},
          placeholder: params.placeholder,
          node: params.node,
        },
      ],
    })),
  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),
  toggleBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, enabled: !block.enabled } : block
      ),
    })),
  updateBlockData: (id, data) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, data: { ...block.data, ...data } } : block
      ),
    })),
  incrementClicks: (id) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, clicks: block.clicks + 1 } : block
      ),
    })),
  incrementViews: (id) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, views: block.views + 1 } : block
      ),
    })),
}));
