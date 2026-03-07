import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const fail = (message) => {
  console.error(`\n[check:security] ${message}`);
  process.exit(1);
};

const run = (label, command, args) => {
  console.log(`\n[check:security] ${label}`);
  console.log(`[check:security] > ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    fail(`${label} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${label} failed with exit code ${result.status ?? "unknown"}.`);
  }
};

if (!existsSync(`${repoRoot}/package-lock.json`)) {
  fail("package-lock.json is required for npm audit. Generate it before building.");
}

run("Checking npm advisories", "npm", ["audit", "--audit-level=high"]);
run("Scanning dependencies and secrets with Trivy", "trivy", [
  "fs",
  "-q",
  "--scanners",
  "vuln,secret",
  "--include-dev-deps",
  "--severity",
  "HIGH,CRITICAL",
  "--exit-code",
  "1",
  "--skip-dirs",
  "node_modules,.git,.svelte-dist",
  ".",
]);
run("Scanning local configuration with Trivy", "trivy", [
  "config",
  "-q",
  "--severity",
  "HIGH,CRITICAL",
  "--exit-code",
  "1",
  ".",
]);

console.log("\n[check:security] All security prebuild checks passed.");
