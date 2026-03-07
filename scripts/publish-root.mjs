import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(repoRoot, ".svelte-dist");
const rootAssetsDir = resolve(repoRoot, "assets");
const distAssetsDir = resolve(distDir, "assets");

const copyFileToRoot = (name) => {
  const source = resolve(distDir, name);
  const destination = resolve(repoRoot, name);

  if (existsSync(source)) {
    cpSync(source, destination, { force: true });
  }
};

if (!existsSync(distDir)) {
  throw new Error("Missing build output in .svelte-dist. Run `vite build` first.");
}

if (existsSync(rootAssetsDir)) {
  rmSync(rootAssetsDir, { recursive: true, force: true });
}

if (existsSync(distAssetsDir)) {
  mkdirSync(rootAssetsDir, { recursive: true });
  cpSync(distAssetsDir, rootAssetsDir, { recursive: true, force: true });
}

for (const fileName of [
  "index.html",
  "favicon.svg",
  "CNAME",
  "og-preview.svg",
  "og-preview.png",
  "robots.txt",
  "sitemap.xml",
]) {
  copyFileToRoot(fileName);
}
