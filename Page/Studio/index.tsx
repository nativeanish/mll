import Block from "@/Blocks/Block";
import MobileView from "@/Blocks/MobileView";
import BasicCard from "@/Blocks/studioBlock/BasicBlock";
import NavBar from "@/Blocks/UI/NavBar";
import React, { useEffect } from "react";
import { useBlockStore } from "@/store/useBlockStore";
import { Globe, Loader2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogTrigger } from "@/src/components/ui/dialog";
import BlockDialog from "@/Blocks/studioBlock/BlockDialog";
import { toast } from "sonner";
import {
  compileToHTML,
  isEsbuildReady,
  type SeoMeta,
  initializeEsbuild,
} from "@/utils/compiler";
const DEFAULT_SEO_META = `{
  "title": "My Awesome Website - SEO Optimized",
  "description": "A fully SEO-optimized website built with React and server-side rendering",
  "keywords": "react, seo, website, optimized",
  "author": "Your Name",
  "ogTitle": "My Awesome Website",
  "ogDescription": "Check out my amazing website!",
  "ogImage": "https://example.com/image.jpg"
}`;
const templateFiles = import.meta.glob(
  "../../PageGeneration/**/*.{tsx,ts,jsx,js}",
  {
    query: "?raw",
    import: "default",
  },
);
function Studio() {
  const [html, setHtml] = React.useState<string>("");
  const [seoMeta] = React.useState(DEFAULT_SEO_META);
  const [selectedFile, setSelectedFile] = React.useState<string>("");
  const [isPublishing, setIsPublishing] = React.useState(false);
  const name = useBlockStore((s) => s.name);
  const description = useBlockStore((s) => s.description);
  const avatarUrl = useBlockStore((s) => s.avatarUrl);
  const coverUrl = useBlockStore((s) => s.coverUrl);
  const blocks = useBlockStore((s) => s.blocks);
  React.useEffect(() => {
    const files = Object.keys(templateFiles).map((path) =>
      path.replace("../../PageGeneration/", ""),
    );
    if (files.length > 0) {
      setSelectedFile("index.tsx");
    }
  }, []);
  const loadAllTemplateFiles = React.useCallback(async (): Promise<
    Map<string, string>
  > => {
    const files = new Map<string, string>();

    for (const [path, loader] of Object.entries(templateFiles)) {
      const content = (await loader()) as string;
      // Convert from ../../PageGeneration/... to /src/PageGeneration/...
      const normalizedPath = path.replace(
        "../../PageGeneration/",
        "/src/PageGeneration/",
      );
      files.set(normalizedPath, content);
    }

    return files;
  }, []);

  React.useEffect(() => {
    const handlecompile = async () => {
      try {
        if (!isEsbuildReady()) {
          console.log("Esbuild is not ready yet.");
        }

        if (!selectedFile) {
          console.log("No file selected for compilation.");
          return;
        }
        const parsedSeoMeta: SeoMeta = JSON.parse(seoMeta);

        const files = await loadAllTemplateFiles();
        const entryFile = `/src/PageGeneration/${selectedFile}`;

        const result = await compileToHTML({
          files,
          entryFile,
          props: {
            basicData: {
              name,
              description,
              avatarUrl,
              coverUrl,
            },
            block: blocks,
          },
          seoMeta: parsedSeoMeta,
          mode: "network",
        });
        setHtml(result.html);
      } catch (error) {
        console.error("Error compiling:", error);
      }
    };
    handlecompile();
  }, [
    blocks,
    name,
    description,
    avatarUrl,
    coverUrl,
    selectedFile,
    seoMeta,
    loadAllTemplateFiles,
  ]);
  useEffect(() => {
    const init = async () => {
      try {
        await initializeEsbuild();
      } catch (err) {
        console.log("Failed to initialize esbuild: " + (err as Error).message);
      }
    };
    init();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (!html) {
        toast.error("No HTML to download. Please wait for compilation.");
        return;
      }

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "page"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Your page has been downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download. Please try again.");
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar onPublish={handlePublish} isPublishing={isPublishing} />

      <main className="flex-1 pt-14">
        <div className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
          {/* Editor Panel */}
          <div className="w-full lg:w-[60%] xl:w-[55%] lg:mr-[40%] xl:mr-[45%] overflow-y-auto min-h-screen relative">
            {/* Background decoration - geometric shapes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 h-44 w-44 rotate-12 rounded-lg border-2 border-border bg-accent/20 shadow-[4px_4px_0px_var(--border)]" />
              <div className="absolute top-[40%] -left-14 h-36 w-36 -rotate-6 rounded-lg border-2 border-border bg-primary/15 shadow-[4px_4px_0px_var(--border)]" />
              <div className="absolute top-[20%] right-[15%] h-20 w-20 rotate-45 rounded-md border-2 border-border bg-secondary/20 shadow-[3px_3px_0px_var(--border)]" />
              <div className="absolute top-[65%] right-16 h-14 w-14 rounded-full border-2 border-border bg-nb-pink/15 shadow-[2px_2px_0px_var(--border)]" />
              <div className="absolute top-32 left-[20%] h-10 w-10 rounded-md border-2 border-border bg-nb-orange/20 shadow-[2px_2px_0px_var(--border)]" />
              <div className="absolute bottom-[25%] left-8 h-16 w-16 rotate-12 rounded-md border-2 border-border bg-nb-purple/15 shadow-[3px_3px_0px_var(--border)]" />
              <div className="absolute bottom-[10%] right-[30%] h-12 w-12 -rotate-12 rounded-full border-2 border-border bg-nb-teal/15 shadow-[2px_2px_0px_var(--border)]" />
              {/* Grid dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1.5px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8 pb-28 space-y-0 relative z-10">
              {/* Section Label - Neo-brutal style, full width */}
              <div className="mb-6 bg-nb-yellow border-2 border-border rounded-lg px-4 py-3 shadow-[4px_4px_0px_var(--border)] w-full">
                <h1 className="text-xl font-black tracking-tight uppercase text-black">
                  Page Builder
                </h1>
                <p className="text-sm text-black/70 font-bold mt-1">
                  Customize your profile and add content blocks
                </p>
              </div>

              <BasicCard />
              <Block />

              {/* Mobile-only publish button */}
              <div className="sm:hidden pt-6 pb-4">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full rounded-lg h-12 font-black uppercase tracking-wide"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Publish Page
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Add Block button - Neo-brutal */}
          <div className="fixed bottom-6 left-0 lg:w-[60%] xl:w-[55%] w-full z-40 pointer-events-none">
            <div className="max-w-xl mx-auto px-4 sm:px-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="pointer-events-auto w-full rounded-lg bg-accent text-accent-foreground border-2 border-border border-dashed h-14 font-black uppercase tracking-wide shadow-[4px_4px_0px_var(--border)] hover:shadow-[6px_6px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary border-2 border-border p-1.5">
                        <Plus className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span>Add Block</span>
                    </div>
                  </Button>
                </DialogTrigger>
                <BlockDialog />
              </Dialog>
            </div>
          </div>

          {/* Preview Panel */}
          <MobileView
            frameHeight={700}
            frameWidth={350}
            html={html}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            allow="clipboard-read; clipboard-write"
            square={false}
            disableLinks={true}
          />
        </div>
      </main>
    </div>
  );
}
export default Studio;
