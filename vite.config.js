import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    viteReact(),
    tailwindcss(),
  ],

  server: {
    port: 3005,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
}));

