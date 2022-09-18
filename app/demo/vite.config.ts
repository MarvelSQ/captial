/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
  server: {
    host: true,
    watch: {
      ignored: ["!**/@marvelsq/lc-core/**"],
    },
  },
  optimizeDeps: {
    exclude: ["@marvelsq/lc-core"],
  },
  test: {
    coverage: {
      enabled: true,
    },
  },
});
