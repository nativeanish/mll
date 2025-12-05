import Block from "@/Blocks/Block";
import MobileView from "@/Blocks/MobileView";
import AddBlock from "@/Blocks/studioBlock/AddBlock";
import BasicCard from "@/Blocks/studioBlock/BasicBlock";
import NavBar from "@/Blocks/UI/NavBar";
import React, { useEffect } from "react";
import { useBlockStore } from "@/store/useBlockStore";
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
  }
);
function Studio() {
  const [html, setHtml] = React.useState<string>("");
  const [seoMeta] = React.useState(DEFAULT_SEO_META);
  const [selectedFile, setSelectedFile] = React.useState<string>("");
  const name = useBlockStore((s) => s.name);
  const description = useBlockStore((s) => s.description);
  const avatarUrl = useBlockStore((s) => s.avatarUrl);
  const coverUrl = useBlockStore((s) => s.coverUrl);
  const blocks = useBlockStore((s) => s.blocks);
  React.useEffect(() => {
    const files = Object.keys(templateFiles).map((path) =>
      path.replace("../../PageGeneration/", "")
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
        "/src/PageGeneration/"
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
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full">
        <NavBar />
      </div>
      <div className="container mx-auto flex-1">
        <div className="flex flex-1 flex-col gap-4 pt-0 mt-16">
          <div className="w-full min-h-screen flex flex-col lg:flex-row relative">
            <div className="w-full lg:w-[70%] lg:mr-[30%] overflow-y-auto min-h-screen pt-8 px-4">
              <BasicCard />
              <AddBlock />
              <Block />
            </div>
            <MobileView
              frameHeight={700}
              frameWidth={350}
              html={html}
              sandbox="allow-scripts allow-same-origin allow-modals" // needed for module imports + hydration
              allow="clipboard-read; clipboard-write"
              square={false}
              disableLinks={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Studio;
