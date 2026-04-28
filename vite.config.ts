import { defineConfig } from "vite";

export default defineConfig({
  base: "/combat-lab-webdemo-0.2-r3-handfeel-fix6-normalized-sprites/",
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false }
});
