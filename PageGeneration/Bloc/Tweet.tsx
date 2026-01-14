import type { BlockData } from "@/store/useBlockStore";
import { getStringField } from "../utils/getStringFields";
import React, { useEffect, useRef } from "react";

// Helper to extract tweet id from URL
function extractTweetId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/status\/(\d+)/);
    return match?.[1] ?? null;
  } catch {
    const match = url.match(/\/status\/(\d+)/);
    return match?.[1] ?? null;
  }
}

function loadTwitterWidgetScript() {
  if (typeof window === "undefined") return;
  if (window.twttr) return;
  const scriptId = "twitter-wjs";
  if (document.getElementById(scriptId)) return;
  const script = document.createElement("script");
  script.id = scriptId;
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.body.appendChild(script);
}

function Tweet({ props }: { props: BlockData }) {
  const title = getStringField(props.data, "title");
  const description = getStringField(props.data, "description");
  const urls = (props.data.urls as Array<string>) ?? [];
  const normalized = React.useMemo(
    () =>
      urls
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u) => u.length > 0),
    [urls]
  );

  // Refs for each tweet blockquote
  const tweetRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadTwitterWidgetScript();
  }, []);

  useEffect(() => {
    // Wait for widget.js to be loaded
    function renderTweets() {
      if (window.twttr && window.twttr.widgets) {
        tweetRefs.current.forEach((ref) => {
          if (ref) {
            window.twttr.widgets.load(ref);
          }
        });
      }
    }
    // Try to render after a short delay (in case script is async)
    const timeout = setTimeout(renderTweets, 300);
    return () => clearTimeout(timeout);
  }, [normalized]);

  return (
    <div className="w-full" data-uuid={props.id}>
      {normalized.length > 0 ? (
        <div className="w-full">
          <div className="mb-4">
            <h3 className="text-gray-900 font-semibold text-lg">
              {title ?? "Tweets"}
            </h3>
            {description ? (
              <p className="text-gray-600 text-sm mt-1">{description}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {normalized.map((url, idx) => {
              const tweetId = extractTweetId(url);
              return (
                <div
                  key={url + idx}
                  ref={(el) => (tweetRefs.current[idx] = el)}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  {tweetId ? (
                    <blockquote
                      className="twitter-tweet"
                      data-theme="light"
                      style={{ margin: 0 }}
                    >
                      <a
                        href={`https://twitter.com/i/web/status/${tweetId}`}
                      ></a>
                    </blockquote>
                  ) : (
                    <div className="p-4 text-red-600 text-sm">
                      Invalid tweet URL
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Tweet;
