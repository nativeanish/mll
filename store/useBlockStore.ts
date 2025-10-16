import { create } from "zustand";
import { uuidv7 } from "uuidv7";
import type { IconType } from "react-icons";

export interface BlockData {
  id: string;
  alt: string;
  name: string;
  icon: IconType | React.ComponentType;
  display: string[] | string;
  enabled: boolean;
  clicks: number;
  views: number;
  data?: Record<string, any>;
}

interface BlockStore {
  blocks: BlockData[];
  addBlock: (
    alt: string,
    name: string,
    icon: IconType | React.ComponentType,
    display: string[] | string
  ) => void;
  removeBlock: (id: string) => void;
  toggleBlock: (id: string) => void;
  updateBlockData: (id: string, data: Record<string, any>) => void;
  incrementClicks: (id: string) => void;
  incrementViews: (id: string) => void;
}

export const useBlockStore = create<BlockStore>((set) => ({
  blocks: [],
  addBlock: (alt, name, icon, display) =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: uuidv7(),
          alt,
          name,
          icon,
          display: Array.isArray(display) ? display : [display],
          enabled: true,
          clicks: 0,
          views: 0,
          data: {},
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
