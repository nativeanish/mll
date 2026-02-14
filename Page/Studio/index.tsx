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
          <div className="w-full lg:w-[60%] xl:w-[55%] lg:mr-[40%] xl:mr-[45%] overflow-y-auto min-h-screen">
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-0">
              {/* Section Label */}
              <div className="mb-6">
                <h1 className="text-xl font-bold tracking-tight">
                  Page Builder
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize your profile and add content blocks
                </p>
              </div>

              <BasicCard />
              <Block />

              {/* Mobile-only publish button */}
              <div className="sm:hidden pt-6 pb-8">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 h-12 font-medium"
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

          {/* Floating Add Block button */}
          <div className="fixed bottom-6 left-0 lg:w-[60%] xl:w-[55%] w-full z-40 pointer-events-none">
            <div className="max-w-xl mx-auto px-4 sm:px-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="pointer-events-auto w-full rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/15 text-neutral-400 hover:text-neutral-200 h-14 transition-all duration-300 group shadow-lg shadow-black/10 border-2 border-dashed border-neutral-500/40 hover:border-neutral-400/60"
                  >
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-neutral-600 p-1.5 group-hover:bg-neutral-500 transition-colors">
                        <Plus className="h-4 w-4 text-neutral-300 group-hover:text-white" />
                      </div>
                      <span className="font-semibold">Add Block</span>
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
