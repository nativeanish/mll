import { Plus, Search, ChevronDown } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/src/components/ui/sidebar";

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
        childNode.name.toLowerCase().includes(query)
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
      childNode.name.toLowerCase().includes(query)
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
        "Twitter-Post": "https://x.com/aoTheComputer/status/2021694557423796248",
        "Reddit-Post":
          "https://www.reddit.com/r/Arweave/comments/1qz58k7/time_to_shut_up_and_build/",
        "Farcaster-Post": "https://farcaster.xyz/jonnyringo.eth/0xbef66a87",
        "Bluesky-Post": "https://bsky.app/profile/hackernoon.com/post/3lu5d6yrser25",
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
        '[data-slot="dialog-close"]'
      ) as HTMLButtonElement;
      closeButton?.click();
    }, 200);
  };

  return (
    <DialogContent className="overflow-hidden p-0 max-h-[85vh] h-full md:h-auto md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] [&>button]:top-3 [&>button]:right-3 [&>button]:z-50 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-sm">
      <DialogTitle className="sr-only">Settings</DialogTitle>
      <DialogDescription className="sr-only">
        Customize your settings here.
      </DialogDescription>
      <SidebarProvider className="items-start">
        <Sidebar collapsible="none" className="hidden md:flex">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNodes.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.name === selected}
                      >
                        <button onClick={() => setSelected(item.name)}>
                          <item.icon />
                          <span>{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex h-full md:h-[480px] flex-1 flex-col overflow-hidden">
          <header className="flex h-auto md:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex-col md:flex-row p-3 pr-12 md:pr-0 md:p-0 border-b md:border-b-0">
            <div className="flex items-center gap-2 w-full md:px-4">
              <Breadcrumb className="hidden md:block">
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Add Block</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selected}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="md:hidden w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const selectedItem = filteredNodes.find(
                            (item) => item.name === selected
                          );
                          return selectedItem ? (
                            <>
                              <selectedItem.icon className="h-4 w-4" />
                              <span>{selectedItem.name}</span>
                            </>
                          ) : null;
                        })()}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[calc(100vw-2rem)]"
                    align="start"
                  >
                    {filteredNodes.map((item) => (
                      <DropdownMenuItem
                        key={item.name}
                        onClick={() => setSelected(item.name)}
                        className="flex items-center gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="md:hidden w-full mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-3 md:gap-4 overflow-y-auto p-3 md:p-4 md:pt-0">
            {searchQuery.trim() && (
              <div className="text-xs md:text-sm text-muted-foreground">
                {filteredNodes.length === 0 ? (
                  <span>No blocks found for "{searchQuery}"</span>
                ) : (
                  <span>
                    Showing results for "{searchQuery}" ({filteredNodes.length}{" "}
                    categories)
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filteredNodes.find((item) => item.name === selected)
                ? getFilteredChildNodes(
                    filteredNodes.find((item) => item.name === selected)!
                  ).map((block) => (
                    <div
                      key={block.name}
                      className={`group cursor-pointer relative flex flex-col p-4 md:p-6 bg-card border rounded-lg transition-all duration-200 min-h-[120px] md:min-h-[140px] border-border hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]`}
                      onClick={() => handleAddBlock(block.alt)}
                    >
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div
                          className={`p-2 md:p-3 rounded-lg transition-colors shrink-0 bg-primary/10 group-hover:bg-primary/20 text-primary`}
                        >
                          <block.icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-sm font-semibold transition-colors mb-1 md:mb-2 text-foreground group-hover:text-primary`}
                          >
                            {block.name}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
                            {block.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          className={`w-full transition-all duration-200 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground h-8 md:h-9`}
                        >
                          <>
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Add {block.name}
                          </>
                        </Button>
                      </div>

                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-primary/3`}
                      />

                      {(() => {
                        const count = blocks.filter(
                          (b) => b.alt === block.alt
                        ).length;
                        return count > 0 ? (
                          <div className="absolute top-2 right-2 min-w-5 h-5 px-2 flex items-center justify-center rounded-full bg-green-500 text-xs text-white font-bold shadow">
                            {count}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ))
                : searchQuery.trim() && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No blocks found in the selected category
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </DialogContent>
  );
}
