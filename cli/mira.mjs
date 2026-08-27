#!/usr/bin/env node

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SEED_REPO = "https://github.com/dangjingtao/com-design-prototype.git";

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function npmName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "prototype";
}

function csv(value) {
  return new Set(value.split(",").map(item => item.trim().toLowerCase()).filter(Boolean));
}

function flagValue(args, name) {
  const prefix = `${name}=`;
  const item = args.find(arg => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : undefined;
}

async function createPrototype(nameArg, args) {
  const rl = createInterface({ input, output });
  try {
    const rawName = nameArg || flagValue(args, "--name") || await rl.question("Project name: ");
    const name = npmName(rawName);

    const titleFlag = flagValue(args, "--title");
    const titleInput = titleFlag ?? await rl.question(`Product title (${rawName || name}): `);
    const title = titleInput.trim() || rawName || name;

    const targetsInput = flagValue(args, "--targets") ?? await rl.question("Targets [mobile,pc]: ");
    const targets = csv(targetsInput || "mobile,pc");

    const deployInput = flagValue(args, "--deploy") ?? await rl.question("Deploy [github,cloudflare]: ");
    const deployments = csv(deployInput || "github,cloudflare");

    if (!targets.has("mobile") && !targets.has("pc")) {
      throw new Error("At least one target is required: mobile or pc.");
    }

    const destination = resolve(process.cwd(), name);
    if (existsSync(destination)) throw new Error(`Destination already exists: ${destination}`);

    console.log("\nPlanting a new prototype...\n");
    run("git", ["clone", "--depth", "1", SEED_REPO, destination], process.cwd());

    rmSync(resolve(destination, ".git"), { recursive: true, force: true });
    rmSync(resolve(destination, "cli"), { recursive: true, force: true });

    if (!targets.has("mobile")) rmSync(resolve(destination, "apps/mobile"), { recursive: true, force: true });
    if (!targets.has("pc")) rmSync(resolve(destination, "apps/pc"), { recursive: true, force: true });
    if (!deployments.has("github")) rmSync(resolve(destination, ".github/workflows/deploy-github-pages.yml"), { force: true });
    if (!deployments.has("cloudflare")) rmSync(resolve(destination, ".github/workflows/deploy-cloudflare.yml"), { force: true });

    const configPath = resolve(destination, "prototype.config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    config.project = { name, title };
    config.targets = { mobile: targets.has("mobile"), pc: targets.has("pc") };
    config.deployment = {
      githubPages: deployments.has("github"),
      cloudflare: deployments.has("cloudflare")
    };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

    const packagePath = resolve(destination, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    packageJson.name = name;
    packageJson.private = true;
    delete packageJson.bin;
    if (!targets.has("mobile")) {
      delete packageJson.scripts["dev:mobile"];
      delete packageJson.scripts["build:mobile"];
    }
    if (!targets.has("pc")) {
      delete packageJson.scripts["dev:pc"];
      delete packageJson.scripts["build:pc"];
    }
    writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    for (const target of ["mobile", "pc"]) {
      if (!targets.has(target)) continue;
      const appDir = resolve(destination, `apps/${target}`);
      const base = `VITE_APP_NAME=${JSON.stringify(title)}\nVITE_APP_TARGET=${target}\nVITE_API_BASE_URL=\n`;
      writeFileSync(resolve(appDir, ".env.example"), base);
      writeFileSync(resolve(appDir, ".env.development"), `${base}VITE_APP_ENV=development\n`);
      writeFileSync(resolve(appDir, ".env.production"), `${base}VITE_APP_ENV=production\n`);
    }

    writeFileSync(resolve(destination, "README.md"), `# ${title}\n\nGenerated from **Com Design Prototype** by Mira.\n\n> Mira plants. Com Design shapes. Prototype proves.\n\n## Start\n\n\`\`\`bash\nnpm install\n${targets.has("mobile") ? "npm run dev:mobile\n" : ""}${targets.has("pc") ? "npm run dev:pc\n" : ""}\`\`\`\n\nRead \`docs/product/00-product-brief.md\`, then keep work in \`docs/workbench/00-work-ledger.md\`.\n`);

    run("git", ["init", "-b", "dev"], destination);

    if (!args.includes("--no-install")) {
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      run(npm, ["install"], destination);
    }

    console.log("\nYour idea has taken root.\n");
    console.log(`  cd ${name}`);
    if (targets.has("mobile")) console.log("  npm run dev:mobile");
    if (targets.has("pc")) console.log("  npm run dev:pc");
    console.log("\nNext: fill docs/product/00-product-brief.md and start T001.\n");
  } finally {
    rl.close();
  }
}

const args = process.argv.slice(2);
const positional = args.filter(arg => !arg.startsWith("--"));

if (positional[0] === "create" && positional[1] === "prototype") {
  createPrototype(positional[2], args).catch(error => {
    console.error(`\nMira could not plant this prototype: ${error.message}\n`);
    process.exit(1);
  });
} else {
  console.log(`Mira CLI\n\nUsage:\n  mira create prototype [name]\n\nOptions:\n  --title=\"Product title\"\n  --targets=mobile,pc\n  --deploy=github,cloudflare\n  --no-install\n`);
}
