import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  root: "app",
  plugins: [svelte()],
  publicDir: "../public",
  build: {
    outDir: "../.svelte-dist",
    emptyOutDir: true,
  },
});
