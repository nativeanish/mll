import { Plus, Search, ChevronDown, Layers } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { useState } from "react";
import { useMemo } from "react";
import { node } from "@/utils/block/block";
import { useBlockStore } from "@/store/useBlockStore";

export default function BlockDialog() {
  const data = node;
  const [selected, setSelected] = useState(data.nav[0].name);
  const [searchQuery, setSearchQuery] = useState("");
  const { addBlock, blocks } = useBlockStore();

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return data.nav;
    }

    const query = searchQuery.toLowerCase().trim();
    return data.nav.filter((navItem) => {
      // Check if nav item name matches
      if (navItem.name.toLowerCase().includes(query)) {
        return true;
      }
      // Check if any child node matches
      return navItem.node.some((childNode) =>
        childNode.name.toLowerCase().includes(query),
      );
    });
  }, [searchQuery, data.nav]);

  // Filter child nodes based on search query
  const getFilteredChildNodes = (navItem: (typeof data.nav)[0]) => {
    if (!searchQuery.trim()) {
      return navItem.node;
    }

    const query = searchQuery.toLowerCase().trim();
    return navItem.node.filter((childNode) =>
      childNode.name.toLowerCase().includes(query),
    );
  };

  const handleAddBlock = (alt: string) => {
    // Find the block in the data structure
    let foundBlock: (typeof data.nav)[number]["node"][number] | null = null;
    let foundNavName: string | null = null;
    for (const navItem of data.nav) {
      const block = navItem.node.find((b) => b.alt === alt);
      if (block) {
        foundBlock = block;
        foundNavName = navItem.name;
        break;
      }
    }

    if (foundBlock) {
      let placeholder = "";
      const postPlaceholders: Record<string, string> = {
        "Twitter-Post":
          "https://x.com/aoTheComputer/status/2021694557423796248",
        "Reddit-Post":
          "https://www.reddit.com/r/Arweave/comments/1qz58k7/time_to_shut_up_and_build/",
        "Farcaster-Post": "https://farcaster.xyz/jonnyringo.eth/0xbef66a87",
        "Bluesky-Post":
          "https://bsky.app/profile/hackernoon.com/post/3lu5d6yrser25",
      };
      // Check if found block belongs to the "Social" category
      if (foundNavName === "Social") {
        if (foundBlock.alt === "Url") {
          placeholder = "Enter a valid URL";
        } else {
          placeholder = `Enter your ${foundBlock.name} URL`;
        }
      } else if (foundNavName === "Post" && postPlaceholders[foundBlock.alt]) {
        placeholder = postPlaceholders[foundBlock.alt];
      }
      addBlock({
        id: crypto.randomUUID(),
        enabled: true,
        clicks: 0,
        views: 0,
        trade: 0,
        placeholder: placeholder || `Enter your ${foundBlock.name} information`,
        alt: foundBlock.alt,
        name: foundBlock.name,
        icon: foundBlock.icon,
        display: foundBlock.display as string[] | string,
        node: foundNavName!,
      });
    }

    setTimeout(() => {
      const closeButton = document.querySelector(
        '[data-slot="dialog-close"]',
      ) as HTMLButtonElement;
      closeButton?.click();
    }, 200);
  };

  const selectedNav = filteredNodes.find((item) => item.name === selected);
  const childNodes = selectedNav ? getFilteredChildNodes(selectedNav) : [];

  return (
    <DialogContent className="overflow-hidden p-0 max-h-[85vh] h-full md:h-auto md:max-h-[560px] md:max-w-[750px] lg:max-w-[860px] rounded-lg border-2 border-border bg-card shadow-[6px_6px_0px_var(--border)] [&>button]:top-2.5 [&>button]:right-2.5 [&>button]:z-60 [&>button]:bg-card [&>button]:text-foreground [&>button]:rounded-md [&>button]:p-1.5 [&>button]:border-2 [&>button]:border-border [&>button]:shadow-[2px_2px_0px_var(--border)] [&>button]:hover:bg-destructive [&>button]:hover:text-white [&>button]:transition-all">
      <DialogTitle className="sr-only">Add Block</DialogTitle>
      <DialogDescription className="sr-only">
        Choose a block to add to your page.
      </DialogDescription>

      <div className="flex h-full md:h-[560px] flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[200px] flex-col border-r-2 border-border bg-muted/30">
          {/* Sidebar header */}
          <div className="px-3 pt-4 pb-2">
            <div className="flex items-center gap-2 px-2 mb-3">
              <Layers className="h-4 w-4 text-foreground" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Blocks
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border-2 border-border rounded-md shadow-[2px_2px_0px_var(--border)] focus:outline-none focus:shadow-[3px_3px_0px_var(--border)] focus:-translate-x-[0.5px] focus:-translate-y-[0.5px] placeholder:text-muted-foreground/60 transition-all font-bold"
              />
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredNodes.map((item) => {
              const isActive = item.name === selected;
              const blockCount = item.node.reduce(
                (acc, n) => acc + blocks.filter((b) => b.alt === n.alt).length,
                0,
              );
              return (
                <button
                  key={item.name}
                  onClick={() => setSelected(item.name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? "bg-accent border-2 border-border text-accent-foreground shadow-[2px_2px_0px_var(--border)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-2 border-transparent"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-accent-foreground" : ""}`}
                  />
                  <span className="flex-1 truncate text-[13px] uppercase tracking-wide">
                    {item.name}
                  </span>
                  {blockCount > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-sm bg-nb-teal border border-border text-black text-[10px] font-black">
                      {blockCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <header className="flex md:hidden flex-col gap-2.5 p-3 pt-10 border-b-2 border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left rounded-lg border-2 border-border h-10 shadow-[2px_2px_0px_var(--border)] font-bold"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedItem = filteredNodes.find(
                        (item) => item.name === selected,
                      );
                      return selectedItem ? (
                        <>
                          <selectedItem.icon className="h-4 w-4 text-foreground" />
                          <span className="text-sm font-bold uppercase tracking-wide">
                            {selectedItem.name}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[calc(100vw-2rem)] rounded-lg"
                align="start"
              >
                {filteredNodes.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => setSelected(item.name)}
                    className="flex items-center gap-2.5 rounded-md cursor-pointer font-bold"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border-2 border-border rounded-md shadow-[2px_2px_0px_var(--border)] focus:outline-none focus:shadow-[3px_3px_0px_var(--border)] focus:-translate-x-[0.5px] focus:-translate-y-[0.5px] placeholder:text-muted-foreground/60 transition-all font-bold"
              />
            </div>
          </header>

          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between px-5 pr-12 py-3 border-b-2 border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-bold uppercase">
                Add Block
              </span>
              <span className="text-muted-foreground font-black">/</span>
              <span className="text-xs font-black text-foreground uppercase tracking-wide">
                {selected}
              </span>
            </div>
            {childNodes.length > 0 && (
              <span className="text-[10px] font-black text-accent-foreground bg-accent border-2 border-border px-2 py-0.5 rounded-sm shadow-[1px_1px_0px_var(--border)] uppercase">
                {childNodes.length}{" "}
                {childNodes.length === 1 ? "block" : "blocks"}
              </span>
            )}
          </div>

          {/* Block grid */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {searchQuery.trim() && filteredNodes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent border-2 border-border shadow-[2px_2px_0px_var(--border)]">
                  <Search className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-sm font-black text-muted-foreground uppercase">
                  No blocks found
                </p>
                <p className="text-xs text-muted-foreground font-bold mt-1">
                  Try a different search term
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {childNodes.map((block) => {
                const count = blocks.filter((b) => b.alt === block.alt).length;
                return (
                  <button
                    key={block.name}
                    type="button"
                    className="group relative flex items-start gap-3 p-3 sm:p-3.5 bg-background hover:bg-accent/20 border-2 border-border hover:border-border rounded-lg shadow-[3px_3px_0px_var(--border)] hover:shadow-[4px_4px_0px_var(--border)] hover:-translate-x-[0.5px] hover:-translate-y-[0.5px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--border)] transition-all text-left cursor-pointer"
                    onClick={() => handleAddBlock(block.alt)}
                  >
                    {/* Icon */}
                    <div className="shrink-0 p-2 rounded-md bg-nb-teal/20 border-2 border-border text-foreground shadow-[2px_2px_0px_var(--border)]">
                      <block.icon className="h-5 w-5" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">
                          {block.name}
                        </h3>
                        {count > 0 && (
                          <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-sm bg-nb-teal border border-border text-black text-[10px] font-black">
                            {count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                        {block.description}
                      </p>
                    </div>

                    {/* Add indicator — visible on mobile too */}
                    <div className="shrink-0 self-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <div className="flex h-7 w-7 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-accent border-2 border-border text-accent-foreground shadow-[1px_1px_0px_var(--border)]">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {childNodes.length === 0 &&
              searchQuery.trim() &&
              filteredNodes.length > 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground font-bold">
                    No blocks found in this category
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </DialogContent>
  );
}
