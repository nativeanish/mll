import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { RouterProvider } from "@tanstack/react-router";
import router from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 1, // 1 minutes
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff up to 30 seconds
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
