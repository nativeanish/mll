import { useBlockStore } from "@/store/useBlockStore";
import BlockItem from "./BlockItem";
import React from "react";
import { Layers } from "lucide-react";

function Block() {
  const { blocks, removeBlock, toggleBlock } = useBlockStore();
  React.useEffect(() => {
    console.log(blocks);
  }, [blocks]);
  if (blocks.length === 0) {
    return (
      <div className="mt-6 w-full max-w-xl">
        <div className="rounded-lg border-2 border-dashed border-border bg-muted py-16 px-6 text-center shadow-[4px_4px_0px_var(--border)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
            <Layers className="h-6 w-6 text-accent-foreground" />
          </div>
          <p className="text-sm font-bold text-foreground max-w-xs mx-auto">
            No blocks added yet. Click{" "}
            <span className="font-black text-primary">"Add Block"</span> below
            to start building your page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-xl space-y-3">
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          onToggle={() => toggleBlock(block.id)}
          onDelete={() => removeBlock(block.id)}
        />
      ))}
    </div>
  );
}

export default Block;
