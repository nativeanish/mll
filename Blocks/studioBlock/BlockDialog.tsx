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
    <DialogContent className="overflow-hidden p-0 max-h-[90vh] h-full md:h-auto md:max-h-[560px] md:max-w-[750px] lg:max-w-[860px] rounded-2xl border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl [&>button]:top-3 [&>button]:right-3 [&>button]:z-50 [&>button]:bg-muted/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-sm [&>button]:border-0 [&>button]:hover:bg-muted">
      <DialogTitle className="sr-only">Add Block</DialogTitle>
      <DialogDescription className="sr-only">
        Choose a block to add to your page.
      </DialogDescription>

      <div className="flex h-full md:h-[560px] flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[200px] flex-col border-r border-border/30 bg-muted/20">
          {/* Sidebar header */}
          <div className="px-3 pt-4 pb-2">
            <div className="flex items-center gap-2 px-2 mb-3">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                Blocks
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background/60 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/40 transition-all"
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                  />
                  <span className="flex-1 truncate text-[13px]">
                    {item.name}
                  </span>
                  {blockCount > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
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
          <header className="flex md:hidden flex-col gap-2.5 p-3 pr-12 border-b border-border/30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left rounded-xl border-border/50 h-10"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedItem = filteredNodes.find(
                        (item) => item.name === selected,
                      );
                      return selectedItem ? (
                        <>
                          <selectedItem.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {selectedItem.name}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[calc(100vw-2rem)] rounded-xl"
                align="start"
              >
                {filteredNodes.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => setSelected(item.name)}
                    className="flex items-center gap-2.5 rounded-lg cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/40 transition-all"
              />
            </div>
          </header>

          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/50">
                Add Block
              </span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-xs font-semibold text-foreground">
                {selected}
              </span>
            </div>
            {childNodes.length > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground/50 bg-muted/40 px-2 py-0.5 rounded-full">
                {childNodes.length}{" "}
                {childNodes.length === 1 ? "block" : "blocks"}
              </span>
            )}
          </div>

          {/* Block grid */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {searchQuery.trim() && filteredNodes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                  <Search className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">
                  No blocks found
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
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
                    className="group relative flex items-start gap-3.5 p-3.5 bg-background/50 hover:bg-muted/40 border border-border/30 hover:border-border/60 rounded-xl transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
                    onClick={() => handleAddBlock(block.alt)}
                  >
                    {/* Icon */}
                    <div className="shrink-0 p-2 rounded-xl bg-primary/5 ring-1 ring-primary/10 text-primary group-hover:bg-primary/10 group-hover:ring-primary/20 transition-all">
                      <block.icon className="h-5 w-5" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {block.name}
                        </h3>
                        {count > 0 && (
                          <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                            {count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 leading-relaxed mt-0.5 line-clamp-2">
                        {block.description}
                      </p>
                    </div>

                    {/* Add indicator */}
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                  <p className="text-sm text-muted-foreground/60">
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
