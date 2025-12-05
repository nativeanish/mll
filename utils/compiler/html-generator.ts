import type { SeoMeta, BuildMode, HtmlDocumentOptions } from "./types";

export function generateMetaTags(seoMeta: SeoMeta): string {
  const title = seoMeta.title || "React App";
  const description = seoMeta.description || "";
  const ogTitle = seoMeta.ogTitle || title;
  const ogDescription = seoMeta.ogDescription || description;

  return `
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${seoMeta.keywords || ""}">
  <meta name="author" content="${seoMeta.author || ""}">

  <!-- Open Graph tags for Facebook, LinkedIn, etc. -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  ${
    seoMeta.ogImage
      ? `<meta property="og:image" content="${seoMeta.ogImage}">`
      : ""
  }

  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDescription}">
  ${
    seoMeta.ogImage
      ? `<meta name="twitter:image" content="${seoMeta.ogImage}">`
      : ""
  }`;
}

export function generateStructuredData(seoMeta: SeoMeta): string {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seoMeta.title || "React App",
      description: seoMeta.description || "",
      author: {
        "@type": "Person",
        name: seoMeta.author || "Unknown",
      },
    },
    null,
    2
  );
}

function generateReactScripts(mode: BuildMode): string {
  if (mode === "network") {
    // Modern ES modules approach with import maps
    // This lets the browser cache React separately from your app code
    return `
  <!-- React 18 via esm.sh (cached separately, great for repeat visits) -->
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18?dev",
        "react-dom": "https://esm.sh/react-dom@18?dev",
        "react-dom/client": "https://esm.sh/react-dom@18/client?dev"
      }
    }
  </script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>`;
  }

  // Bundled mode - use React 17 to match our SSR
  // (React 17 hydrate is more forgiving than React 18's hydrateRoot)
  return `
  <!-- React 17 for hydration (matches SSR version) -->
  <script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>`;
}

function generateHydrationScript(options: {
  transformedCode: string;
  componentName: string;
  props: Record<string, unknown>;
  isBundled: boolean;
}): string {
  const { transformedCode, componentName, props, isBundled } = options;

  if (isBundled) {
    // Bundled code exports to __AppModule
    return `
    // Your bundled component code
    ${transformedCode}

    // Get the component from the bundle
    var AppComponent = __AppModule && __AppModule.default ? __AppModule.default : __AppModule;

    // Props that were used for SSR
    var appProps = ${JSON.stringify(props, null, 2)};

    // Hydrate the pre-rendered HTML to make it interactive
    try {
      ReactDOM.hydrate(
        React.createElement(AppComponent, appProps),
        document.getElementById('root')
      );
      console.log('Hydration complete! Page is now interactive.');
    } catch (e) {
      console.warn('Hydration skipped:', e.message);
    }`;
  }

  // Non-bundled: need to provide React hooks as globals
  return `
    // Make React hooks available (since imports were stripped)
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useContext = React.useContext;
    var useReducer = React.useReducer;
    var useCallback = React.useCallback;
    var useMemo = React.useMemo;
    var useRef = React.useRef;
    var useLayoutEffect = React.useLayoutEffect;
    var Fragment = React.Fragment;
    var memo = React.memo;

    // Your component code
    ${transformedCode}

    // Props that were used for SSR
    var appProps = ${JSON.stringify(props, null, 2)};

    // Hydrate to make it interactive
    try {
      ReactDOM.hydrate(
        React.createElement(${componentName}, appProps),
        document.getElementById('root')
      );
      console.log('Hydration complete! Page is now interactive.');
    } catch (e) {
      console.warn('Hydration skipped:', e.message);
    }`;
}

export function generateHtmlDocument(options: HtmlDocumentOptions): string {
  const {
    renderedHTML,
    transformedCode,
    componentName,
    props,
    seoMeta,
    mode = "bundled",
    isBundled = false,
  } = options;

  const metaTags = generateMetaTags(seoMeta);
  const structuredData = generateStructuredData(seoMeta);
  const reactScripts = generateReactScripts(mode);
  const hydrationScript = generateHydrationScript({
    transformedCode,
    componentName,
    props,
    isBundled,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${metaTags}

  <!-- Structured data helps search engines understand your content -->
  <script type="application/ld+json">
  ${structuredData}
  </script>
  ${reactScripts}
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

</head>
<body>
  <!--
    This is the pre-rendered HTML - search engines see this immediately!
    The page works even with JavaScript disabled.
  -->
  <div id="root">${renderedHTML}</div>

  <!--
    Hydration script - this makes the page interactive.
    Without this, you'd still see the content, just no click handlers etc.
  -->
  <script>
    ${hydrationScript}
  </script>
</body>
</html>`;
}
