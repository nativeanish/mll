import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "../theme/ThemeProvider";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
export const Route = createRootRoute({
  component: () => {
    return <App />;
  },
});
export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster position="top-center" richColors />
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </>
  );
}
