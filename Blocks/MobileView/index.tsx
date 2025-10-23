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
};

// Ensure the provided HTML has a viewport meta for mobile-like layout
function withViewport(html: string): string {
  const hasHtml = /<html[\s>]/i.test(html);
  const hasHead = /<head[\s>]/i.test(html);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

  const viewportTag =
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />';

  if (hasHtml) {
    if (!hasHead) {
      return html.replace(
        /<html([^>]*)>/i,
        (_m, attrs) => `<html${attrs}><head>${viewportTag}</head>`
      );
    }
    if (!hasViewport) {
      return html.replace(/<head[^>]*>/i, (m) => `${m}${viewportTag}`);
    }
    return html;
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
      <script>
        // Optional: notify parent of content height once ready
        window.addEventListener('load', function(){
          try {
            var h = document.documentElement.scrollHeight || document.body.scrollHeight;
            parent && parent.postMessage({ __mobileViewHeight: h }, '*');
          } catch (e) {}
        });
      </script>
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

  const srcDoc = html ? withViewport(html) : undefined;

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
          sandbox={sandbox}
          allow={allow}
          onLoad={() => {
            if (onLoad && iframeRef.current) onLoad(iframeRef.current);
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
