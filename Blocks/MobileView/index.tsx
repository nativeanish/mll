import { useEffect, useRef, useState } from "react";
import { Smartphone, X } from "lucide-react";

// MobileView renders arbitrary HTML/CSS/JS in a sandboxed iframe, sized like a phone.
export type MobileViewProps = {
  // Provide raw HTML to render inside the mobile preview (preferred for local content)
  html?: string;
  // Or load a remote/local URL
  src?: string;
  // Outer frame size (simulated device shell)
  frameWidth?: number; // px
  frameHeight?: number; // px
  // Optional classes to position the preview on screen
  className?: string;
  // Sandbox/permissions for iframe security. Defaults are permissive for previewing; tighten for untrusted content.
  sandbox?: string;
  allow?: string;
  // Called when iframe has loaded
  onLoad?: (iframe: HTMLIFrameElement) => void;
  // Mobile-only: show a floating toggle button to open preview
  showToggleOnMobile?: boolean;
  // Customize mobile toggle button class
  mobileButtonClassName?: string;
  // Customize mobile overlay container class
  overlayClassName?: string;
  // Keep the content viewport square: height = width
  square?: boolean;
  // Show decorative notch/home indicator
  showDecorations?: boolean;
  // Disable all anchor/link navigation inside the preview (recommended for demos)
  disableLinks?: boolean;
};

// Ensure the provided HTML has a viewport meta for mobile-like layout
function withViewport(html: string, opts?: { disableLinks?: boolean }): string {
  const hasHtml = /<html[\s>]/i.test(html);
  const hasHead = /<head[\s>]/i.test(html);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

  const viewportTag =
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />';

  const disableLinksStyle = opts?.disableLinks
    ? `<style id="__mv-disable-links">
        a, area { pointer-events: none !important; cursor: not-allowed !important; }
      </style>`
    : "";

  const disableLinksScript = opts?.disableLinks
    ? `<script id="__mv-disable-links-script">
        (function(){
          try {
            // Prevent all anchor navigations (just in case CSS is overridden)
            document.addEventListener('click', function(ev){
              var el = ev.target;
              while (el && el !== document) {
                if (el.tagName && el.tagName.toLowerCase() === 'a') {
                  ev.preventDefault();
                  ev.stopPropagation();
                  return false;
                }
                el = el.parentNode;
              }
            }, true);
          } catch (e) {}
        })();
      </script>`
    : "";

  if (hasHtml) {
    if (!hasHead) {
      return html.replace(
        /<html([^>]*)>/i,
        (_m, attrs) =>
          `<html${attrs}><head>${viewportTag}${disableLinksStyle}${disableLinksScript}</head>`,
      );
    }
    // Ensure viewport, then inject disable-links assets right after <head>
    let out = html;
    if (!hasViewport) {
      out = out.replace(/<head[^>]*>/i, (m) => `${m}${viewportTag}`);
    }
    return out.replace(
      /<head[^>]*>/i,
      (m) => `${m}${disableLinksStyle}${disableLinksScript}`,
    );
  }

  // If fragment, wrap it into a full document with viewport
  return `<!doctype html>
  <html lang="en">
    <head>
      ${viewportTag}
      <meta charset="utf-8" />
      <style>
        html, body, #root { height: 100%; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
      </style>
      ${disableLinksStyle}
      <script>
        // Optional: notify parent of content height once ready
        window.addEventListener('load', function(){
          try {
            var h = document.documentElement.scrollHeight || document.body.scrollHeight;
            parent && parent.postMessage({ __mobileViewHeight: h }, '*');
          } catch (e) {}
        });
      </script>
      ${disableLinksScript}
    </head>
    <body>
      ${html}
    </body>
  </html>`;
}

export default function MobileView({
  html,
  src,
  frameWidth = 393,
  frameHeight = 393,
  className = "hidden lg:flex fixed right-0 top-0 h-screen w-[30%] items-center justify-center",
  sandbox = "allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-modals allow-popups allow-popups-to-escape-sandbox",
  allow = "clipboard-read; clipboard-write; geolocation; microphone; camera; fullscreen",
  onLoad,
  showToggleOnMobile = true,
  mobileButtonClassName,
  overlayClassName,
  square = true,
  showDecorations = true,
  disableLinks = true,
}: MobileViewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleMessage(ev: MessageEvent) {
      if (
        ev?.data &&
        typeof ev.data === "object" &&
        "__mobileViewHeight" in ev.data
      ) {
        // Example: could auto-size iframe height based on content
        // if (iframeRef.current) iframeRef.current.style.height = `${ev.data.__mobileViewHeight}px`;
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const srcDoc = html ? withViewport(html, { disableLinks }) : undefined;

  // If disabling links for remote src, attempt same-origin injection; also harden sandbox by stripping popup/navigation tokens.
  function computeEffectiveSandbox(base: string, disable: boolean): string {
    if (!disable) return base;
    const tokens = new Set(
      base
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean),
    );
    const toRemove = [
      "allow-popups",
      "allow-popups-to-escape-sandbox",
      "allow-top-navigation",
      "allow-top-navigation-by-user-activation",
    ];
    toRemove.forEach((t) => tokens.delete(t));
    return Array.from(tokens).join(" ");
  }

  const effectiveSandbox = computeEffectiveSandbox(sandbox, disableLinks);

  function injectDisableLinks(doc: Document) {
    try {
      // Style safety net
      const st = doc.createElement("style");
      st.id = "__mv-disable-links";
      st.textContent =
        "a, area { pointer-events: none !important; cursor: not-allowed !important; }";
      if (doc.head) {
        doc.head.appendChild(st);
      }

      // JS safety net
      doc.addEventListener(
        "click",
        (ev) => {
          let el: HTMLElement | null = ev.target as HTMLElement | null;
          while (el) {
            const tag = el.tagName ? el.tagName.toLowerCase() : "";
            if (tag === "a") {
              ev.preventDefault();
              ev.stopPropagation();
              return;
            }
            el = el.parentElement;
          }
        },
        true,
      );
    } catch {
      // ignore
    }
  }

  // Square content area and separate top/bottom decorations so content isn't clipped
  const contentWidth = frameWidth;
  const contentHeight = square ? frameWidth : frameHeight;
  const TOP_DECO = showDecorations ? 24 : 0; // px reserved above
  const BOTTOM_DECO = showDecorations ? 16 : 0; // px reserved below
  const outerWidth = contentWidth;
  const outerHeight = contentHeight + TOP_DECO + BOTTOM_DECO;

  const DeviceShell = (
    <div
      className="relative bg-white rounded-[2rem] shadow-2xl border-4 border-gray-300 overflow-hidden"
      style={{ width: outerWidth, height: outerHeight }}
    >
      {showDecorations && (
        <>
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 mt-2 h-6 w-36 bg-black/30 rounded-full z-10" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-24 bg-black/25 rounded-full z-10" />
        </>
      )}
      <div
        className="absolute left-0 right-0"
        style={{ top: TOP_DECO, bottom: BOTTOM_DECO }}
      >
        <iframe
          ref={iframeRef}
          title="Mobile Preview"
          src={src}
          srcDoc={srcDoc}
          sandbox={effectiveSandbox}
          allow={allow}
          onLoad={() => {
            if (onLoad && iframeRef.current) onLoad(iframeRef.current);
            // Best effort: if same-origin and disableLinks, inject into remote src
            if (disableLinks && iframeRef.current) {
              try {
                const doc =
                  iframeRef.current.contentDocument ||
                  iframeRef.current.contentWindow?.document;
                if (doc) injectDisableLinks(doc);
              } catch {
                // Cross-origin, cannot inject
              }
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            background: "#fff",
          }}
        />
      </div>
      {!src && !html && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-gray-500 p-4">
          Provide html or src to render inside the mobile preview.
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop view: persist preview on right side */}
      <div className={className}>{DeviceShell}</div>

      {/* Mobile: floating toggle button */}
      {showToggleOnMobile && (
        <button
          type="button"
          aria-label="Open mobile preview"
          onClick={() => setIsOpen(true)}
          className={`lg:hidden fixed right-3 top-1/2 -translate-y-1/2 z-40 rounded-full bg-white border border-gray-200 shadow-lg p-3 active:scale-95 ${
            mobileButtonClassName ?? ""
          }`}
        >
          <Smartphone className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={`lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 ${
            overlayClassName ?? ""
          }`}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute top-4 right-4">
            <button
              type="button"
              aria-label="Close mobile preview"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/95 border border-gray-200 shadow p-2"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {DeviceShell}
        </div>
      )}
    </>
  );
}
