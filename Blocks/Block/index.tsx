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
        <div className="rounded-2xl border border-dashed border-border/50 bg-muted/10 py-16 px-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
            <Layers className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto">
            No blocks added yet. Click{" "}
            <span className="font-medium text-foreground/80">"Add Block"</span>{" "}
            above to start building your page.
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
