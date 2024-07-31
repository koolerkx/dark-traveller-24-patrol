import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import { loadEnv } from "vite";

const vitePWAManifest: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  manifest: {
    name: "Dark Traveller 24",
    short_name: "dark-traveller-24",
    description: "Used by Dark Traveller",
    icons: [
      {
        src: "/favicon/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/favicon/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/favicon/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#9013fe",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env": env,
    },
    plugins: [react(), legacy(), VitePWA(vitePWAManifest)],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
    },
  };
});
