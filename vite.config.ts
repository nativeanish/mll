import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { readFileSync, existsSync } from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      // babel: {
      //   plugins: [
      //     [
      //       "babel-plugin-react-compiler",
      //       {
      //         target: "19",
      //       },
      //     ],
      //   ],
      // },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@/src": path.resolve(__dirname, "./src"),
      "@/assets": path.resolve(__dirname, "./assets"),
      "@/Page": path.resolve(__dirname, "./Page"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@/Blocks": path.resolve(__dirname, "./Blocks"),
      "@/utils": path.resolve(__dirname, "./utils"),
      "@/store": path.resolve(__dirname, "./store"),
    },
  },
  server: {
    port: 3000,
    host: true,
    https: (() => {
      const certDir = path.resolve(__dirname, "./cert");
      const keyPath = path.join(certDir, "key.pem");
      const certPath = path.join(certDir, "cert.pem");
      if (existsSync(keyPath) && existsSync(certPath)) {
        return {
          key: readFileSync(keyPath),
          cert: readFileSync(certPath),
        } as const;
      }
      return undefined;
    })(),
  },
  build: {
    rollupOptions: {
      external: ["data.html"],
    },
  },
});
