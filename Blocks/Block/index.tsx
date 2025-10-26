import { useBlockStore } from "@/store/useBlockStore";
import BlockItem from "./BlockItem";
import React from "react";

function Block() {
  const { blocks, removeBlock, toggleBlock } = useBlockStore();
  React.useEffect(() => {
    console.log(blocks);
  }, [blocks]);
  if (blocks.length === 0) {
    return (
      <div className="mt-8 max-w-xl">
        <div className="text-center py-12 text-muted-foreground">
          <p>
            No blocks added yet. Click the "Add Block" button to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-xl space-y-4">
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
