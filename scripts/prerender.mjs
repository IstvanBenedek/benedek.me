import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(repoRoot, ".svelte-dist");
const ssrDir = resolve(repoRoot, ".svelte-dist-ssr");
const distIndexPath = resolve(distDir, "index.html");

const findEntryFile = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = findEntryFile(fullPath);
      if (nested) {
        return nested;
      }
      continue;
    }

    if (entry.isFile() && /^entry-server\.(m?js|cjs)$/.test(entry.name)) {
      return fullPath;
    }
  }

  return null;
};

if (!existsSync(distIndexPath)) {
  throw new Error("Missing client build output in .svelte-dist/index.html.");
}

if (!existsSync(ssrDir) || !statSync(ssrDir).isDirectory()) {
  throw new Error("Missing SSR build output in .svelte-dist-ssr.");
}

const entryFile = findEntryFile(ssrDir);

if (!entryFile) {
  throw new Error("Could not find the SSR entry file in .svelte-dist-ssr.");
}

const { renderApp } = await import(pathToFileURL(entryFile).href);

if (typeof renderApp !== "function") {
  throw new Error("SSR entry does not export renderApp().");
}

const template = readFileSync(distIndexPath, "utf8");
const appHtml = renderApp();
const output = template.replace(
  '<div id="app"></div>',
  `<div id="app">${appHtml}</div>`,
);

writeFileSync(distIndexPath, output, "utf8");
rmSync(ssrDir, { recursive: true, force: true });
