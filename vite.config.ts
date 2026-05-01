import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __BUILD_HASH__: JSON.stringify(process.env.BUILD_HASH || 'local-dev'),
  },
  base: "/carbon-shade-web/",
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: false }
});
