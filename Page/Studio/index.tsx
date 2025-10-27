import Block from "@/Blocks/Block";
import MobileView from "@/Blocks/MobileView";
import AddBlock from "@/Blocks/studioBlock/AddBlock";
import BasicCard from "@/Blocks/studioBlock/BasicBlock";
import NavBar from "@/Blocks/UI/NavBar";
import PageGeneration from "@/Blocks/PageGeneration";
import pageGenerationSource from "@/Blocks/PageGeneration/index.tsx?raw";
import linkSource from "@/Blocks/PageGeneration/Link.tsx?raw";
import React, { useEffect } from "react";
import { generateHtml } from "@/utils/build/generateHTML";
import { useBlockStore } from "@/store/useBlockStore";
function Studio() {
  const [html, setHtml] = React.useState<string>("");
  useEffect(() => {
    const generate = async () => {
      const { name, description, avatarUrl, coverUrl, blocks } =
        useBlockStore.getState();
      const html = await generateHtml({
        deliveryMode: "network",
        input: {
          type: "component",
          component: PageGeneration as React.ComponentType<unknown>,
          props: {
            basicData: {
              name,
              description,
              avatarUrl,
              coverUrl,
            },
            block: blocks,
          },
          moduleName: "./../Blocks/PageGeneration/index.tsx",
          moduleSource: pageGenerationSource,
        },
        virtualModules: {
          "./../Blocks/PageGeneration/Link.tsx": linkSource,
        },
        htmlTemplate:
          '<!DOCTYPE html><html><head><meta charset="utf-8" />' +
          '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
          "<title>Exported Site</title>" +
          '<meta name="description" content="SEO-friendly React export built client-side." />' +
          "{{PRECONNECT}}" +
          "</head><body>" +
          "{{STATIC_HTML}}" +
          '<script type="module">{{INLINE_MODULE_JS}}</script>' +
          "</body></html>",
      });

      setHtml(html.html);
    };

    // initial generate on mount
    generate();

    // subscribe to store changes and regenerate only when relevant fields change
    const snapshot = () => {
      const { name, description, avatarUrl, coverUrl, blocks } =
        useBlockStore.getState();
      return { name, description, avatarUrl, coverUrl, blocks };
    };

    let prev = snapshot();
    const unsubscribe = useBlockStore.subscribe(() => {
      const next = snapshot();
      if (
        prev.name !== next.name ||
        prev.description !== next.description ||
        prev.avatarUrl !== next.avatarUrl ||
        prev.coverUrl !== next.coverUrl ||
        prev.blocks !== next.blocks
      ) {
        prev = next;
        generate();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full">
        <NavBar />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-16">
        <div className="w-full min-h-screen flex flex-col lg:flex-row relative">
          <div className="w-full lg:w-[70%] lg:mr-[30%] overflow-y-auto min-h-screen p-4">
            <BasicCard />
            <AddBlock />
            <Block />
          </div>
          <MobileView
            frameHeight={700}
            frameWidth={350}
            html={html}
            sandbox="allow-scripts" // safer: avoid combining with allow-same-origin
            allow="clipboard-read; clipboard-write"
            square={false}
            disableLinks={true}
          />
        </div>
      </div>
    </div>
  );
}
export default Studio;
