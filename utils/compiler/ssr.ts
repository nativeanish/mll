import type { SSRResult, SSROptions } from "./types";

function loadScript(doc: Document, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    doc.head!.appendChild(script);
  });
}

async function createReactIframe(): Promise<HTMLIFrameElement> {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;

  // Load React 17 core
  await loadScript(
    doc,
    "https://unpkg.com/react@17/umd/react.production.min.js"
  );

  await loadScript(
    doc,
    "https://unpkg.com/react-dom@17/umd/react-dom-server.browser.production.min.js"
  );

  return iframe;
}

export async function renderToString(
  transformedCode: string,
  componentName: string,
  props: Record<string, unknown>,
  options: SSROptions = {}
): Promise<SSRResult> {
  const { isBundled = false } = options;

  // Create our sandbox iframe with React loaded
  const iframe = await createReactIframe();

  try {
    // Get references to React and ReactDOMServer from the iframe
    const win = iframe.contentWindow as Window & {
      React: typeof import("react");
      ReactDOM: typeof import("react-dom");
      ReactDOMServer: { renderToString: (el: React.ReactElement) => string };
      Function: FunctionConstructor;
    };

    const { React, ReactDOMServer } = win;

    // Sanity check - make sure ReactDOMServer loaded properly
    if (
      !ReactDOMServer ||
      typeof ReactDOMServer.renderToString !== "function"
    ) {
      throw new Error(
        "ReactDOMServer.renderToString is not available. " +
          "This usually means the React 17 scripts failed to load."
      );
    }

    // Now we need to execute the component code and get the component function.
    // This is a bit tricky because the code might reference React hooks directly.
    let Component;

    try {
      let wrappedCode: string;

      if (isBundled) {
        // Bundled code is an IIFE that exports to __AppModule
        // We just need to run it and grab the default export
        wrappedCode = `
          ${transformedCode}
          return __AppModule && __AppModule.default ? __AppModule.default : __AppModule;
        `;
      } else {
        // Non-bundled code might use hooks like useState directly
        // (because we stripped the imports). We need to provide them as locals.
        wrappedCode = `
          // Provide React hooks as local variables
          var useState = React.useState;
          var useEffect = React.useEffect;
          var useContext = React.useContext;
          var useReducer = React.useReducer;
          var useCallback = React.useCallback;
          var useMemo = React.useMemo;
          var useRef = React.useRef;
          var useImperativeHandle = React.useImperativeHandle;
          var useLayoutEffect = React.useLayoutEffect;
          var useDebugValue = React.useDebugValue;

          // Also provide common React utilities
          var createElement = React.createElement;
          var Fragment = React.Fragment;
          var createContext = React.createContext;
          var forwardRef = React.forwardRef;
          var memo = React.memo;
          var lazy = React.lazy;
          var Suspense = React.Suspense;
          var Component = React.Component;
          var PureComponent = React.PureComponent;
          var Children = React.Children;
          var cloneElement = React.cloneElement;
          var isValidElement = React.isValidElement;

          // Now run the actual component code
          ${transformedCode}

          // Return the component so we can render it
          return ${componentName};
        `;
      }

      // Create a function that takes React and ReactDOM, runs the code,
      // and returns the component
      const componentFactory = new win.Function(
        "React",
        "ReactDOM",
        wrappedCode
      );
      Component = componentFactory(React, win.ReactDOM);
    } catch (err) {
      const error = err as Error;
      throw new Error(
        `Failed to execute component code: ${error.message}\n\n` +
          `Common causes:\n` +
          `- TypeScript features that weren't compiled away\n` +
          `- Syntax errors in the component code\n` +
          `- The component name "${componentName}" doesn't match the actual export`
      );
    }

    // Make sure we actually got a component
    if (!Component) {
      throw new Error(
        `Component "${componentName}" is undefined after executing the code. ` +
          `Make sure your component is properly exported with "export default".`
      );
    }

    // Finally! Render the component to HTML
    let html: string;

    try {
      const element = React.createElement(Component, props);
      html = ReactDOMServer.renderToString(element);
    } catch (err) {
      const error = err as Error;
      throw new Error(
        `Component render failed: ${error.message}\n\n` +
          `Common causes:\n` +
          `- Using browser APIs (window, document) during render\n` +
          `- Throwing an error in the component\n` +
          `- useEffect with DOM manipulation (these don't run during SSR)`
      );
    }

    return { html };
  } finally {
    // Always clean up the iframe, even if something went wrong
    document.body.removeChild(iframe);
  }
}
