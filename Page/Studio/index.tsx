import Block from "@/Blocks/Block";
import MobileView from "@/Blocks/MobileView";
import AddBlock from "@/Blocks/studioBlock/AddBlock";
import BasicCard from "@/Blocks/studioBlock/BasicBlock";
import NavBar from "@/Blocks/UI/NavBar";
import PageGeneration from "@/Blocks/PageGeneration";
import pageGenerationSource from "@/Blocks/PageGeneration/index.tsx?raw";
import React, { useEffect } from "react";
import { generateHtml } from "@/utils/build/generateHTML";
function Studio() {
  const [html, setHtml] = React.useState<string>("");
  useEffect(() => {
    async function gener() {
      const html = await generateHtml({
        deliveryMode: "network",
        input: {
          type: "component",
          component: PageGeneration as React.ComponentType<unknown>,
          props: {},
          moduleName: "./../Blocks/PageGeneration/index.tsx",
          moduleSource: pageGenerationSource,
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
    }
    gener();
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
            sandbox="allow-scripts allow-same-origin" // stricter
            allow="clipboard-read; clipboard-write"
            square={false}
          />
        </div>
      </div>
    </div>
  );
}

export default Studio;
