#!/usr/bin/env node

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SEED_REPO = "https://github.com/dangjingtao/com-design-prototype.git";
const AUTHORS = "Tomz <dangjingtao@gmail.com> & Mira <mira@tomz.io>";

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0) throw new Error(`${command} exited with code ${result.status ?? 1}`);
  return result;
}

function capture(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function setSecret(repo, name, value, cwd) {
  const result = spawnSync("gh", ["secret", "set", name, "--repo", repo], {
    cwd,
    input: value,
    encoding: "utf8",
    shell: false,
    stdio: ["pipe", "inherit", "inherit"]
  });
  if (result.status !== 0) throw new Error(`Could not set GitHub secret ${name}.`);
}

function npmName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "prototype";
}

function cloudflareName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
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

function readConfig(cwd) {
  const configPath = resolve(cwd, "prototype.config.json");
  if (!existsSync(configPath)) throw new Error("prototype.config.json was not found. Run this inside a generated prototype.");
  return JSON.parse(readFileSync(configPath, "utf8"));
}

function detectGitHubRepo(cwd) {
  const remote = capture("git", ["config", "--get", "remote.origin.url"], cwd);
  if (remote.status === 0) {
    const value = remote.stdout.trim();
    const match = value.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (match) return `${match[1]}/${match[2]}`;
  }

  const gh = capture("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"], cwd);
  return gh.status === 0 ? gh.stdout.trim() : "";
}

function ensureGitHubEnvironment(repo, environmentName, cwd) {
  run("gh", ["api", "--method", "PUT", `repos/${repo}/environments/${environmentName}`], cwd);
}

function ensureGitHubPages(repo, cwd) {
  const existing = capture("gh", ["api", `repos/${repo}/pages`], cwd);
  if (existing.status === 0) {
    run("gh", ["api", "--method", "PUT", `repos/${repo}/pages`, "-f", "build_type=workflow"], cwd);
  } else {
    run("gh", ["api", "--method", "POST", `repos/${repo}/pages`, "-f", "build_type=workflow"], cwd);
  }
}

async function cloudflareRequest(accountId, apiToken, path, options = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
}

async function ensureCloudflareProject(accountId, apiToken, projectName, productionBranch) {
  const current = await cloudflareRequest(accountId, apiToken, `/${encodeURIComponent(projectName)}`);
  if (current.response.ok) return "exists";
  if (current.response.status !== 404) {
    const message = current.payload?.errors?.[0]?.message || `HTTP ${current.response.status}`;
    throw new Error(`Could not inspect Cloudflare project ${projectName}: ${message}`);
  }

  const created = await cloudflareRequest(accountId, apiToken, "", {
    method: "POST",
    body: JSON.stringify({ name: projectName, production_branch: productionBranch })
  });

  if (!created.response.ok) {
    const message = created.payload?.errors?.[0]?.message || `HTTP ${created.response.status}`;
    throw new Error(`Could not create Cloudflare project ${projectName}: ${message}`);
  }

  return "created";
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

    const seedVersion = readFileSync(resolve(destination, "VERSION"), "utf8").trim();

    rmSync(resolve(destination, ".git"), { recursive: true, force: true });
    rmSync(resolve(destination, "cli"), { recursive: true, force: true });

    if (!targets.has("mobile")) rmSync(resolve(destination, "apps/mobile"), { recursive: true, force: true });
    if (!targets.has("pc")) rmSync(resolve(destination, "apps/pc"), { recursive: true, force: true });
    if (!deployments.has("github")) rmSync(resolve(destination, ".github/workflows/deploy-github-pages.yml"), { force: true });
    if (!deployments.has("cloudflare")) rmSync(resolve(destination, ".github/workflows/deploy-cloudflare.yml"), { force: true });

    const configPath = resolve(destination, "prototype.config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    const cfBase = cloudflareName(name);
    const initialVersion = config.versioning?.initialProjectVersion || "0.1.0";
    config.project = { name, title };
    config.targets = { mobile: targets.has("mobile"), pc: targets.has("pc") };
    config.versioning = {
      strategy: "semver",
      currentVersion: initialVersion,
      seedVersion,
      versionFile: "VERSION",
      changelogFile: "CHANGELOG.md"
    };
    config.deployment = {
      githubPages: {
        enabled: deployments.has("github")
      },
      cloudflare: {
        enabled: deployments.has("cloudflare"),
        provider: "pages",
        projects: {
          mobile: `${cfBase}-mobile`,
          pc: `${cfBase}-pc`
        }
      }
    };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

    writeFileSync(resolve(destination, "VERSION"), `${initialVersion}\n`);
    writeFileSync(resolve(destination, "CHANGELOG.md"), `# Changelog\n\n## [${initialVersion}]\n\n### Added\n\n- Project created from Com Design Prototype seed ${seedVersion}.\n- Initial PC / Mobile prototype baseline.\n- Default work ledger, AI skill interview and CI/CD contracts.\n`);

    const packagePath = resolve(destination, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    packageJson.name = name;
    packageJson.version = initialVersion;
    packageJson.private = true;
    packageJson.author = AUTHORS;
    packageJson.contributors = [
      "Tomz <dangjingtao@gmail.com>",
      "Mira <mira@tomz.io>"
    ];
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

    writeFileSync(resolve(destination, "README.md"), `# ${title}\n\nGenerated from **Com Design Prototype** by Mira.\n\n> Mira plants. Com Design shapes. Prototype proves.\n\nAuthors: ${AUTHORS}\n\n## Start\n\n\`\`\`bash\nnpm install\n${targets.has("mobile") ? "npm run dev:mobile\n" : ""}${targets.has("pc") ? "npm run dev:pc\n" : ""}\`\`\`\n\n## First AI review\n\nBefore substantial AI work, read \`AGENTS.md\` and confirm \`docs/ai/skills.md\` through an interactive AI interview.\n\n## Version control\n\nCurrent version: \`${initialVersion}\`. Keep \`VERSION\`, \`package.json.version\` and \`CHANGELOG.md\` in sync. See \`docs/governance/version-control.md\`.\n\n## CI/CD\n\nPush this project to GitHub, then run:\n\n\`\`\`bash\n${deployments.has("cloudflare") ? "export CLOUDFLARE_ACCOUNT_ID=...\nexport CLOUDFLARE_API_TOKEN=...\n" : ""}mira setup cicd\n\`\`\`\n\n\`dev\` continuously publishes preview deployments. \`prod\` publishes production.\n\nRead \`docs/product/00-product-brief.md\`, then keep work in \`docs/workbench/00-work-ledger.md\`.\n`);

    run("git", ["init", "-b", "dev"], destination);

    if (!args.includes("--no-install")) {
      const npm = process.platform === "win32" ? "npm.cmd" : "npm";
      run(npm, ["install"], destination);
    }

    console.log("\nYour idea has taken root.\n");
    console.log(`  cd ${name}`);
    if (targets.has("mobile")) console.log("  npm run dev:mobile");
    if (targets.has("pc")) console.log("  npm run dev:pc");
    if (deployments.size > 0) console.log("\nAfter pushing to GitHub: mira setup cicd");
    console.log("\nNext: fill the Product Brief, let AI run the Skill Interview, then start T001.\n");
  } finally {
    rl.close();
  }
}

async function setupCicd(args) {
  const cwd = process.cwd();
  const config = readConfig(cwd);
  const repo = flagValue(args, "--repo") || detectGitHubRepo(cwd);
  if (!repo) throw new Error("Could not detect a GitHub repository. Add origin or pass --repo=owner/name.");

  const gh = capture("gh", ["auth", "status"], cwd);
  if (gh.status !== 0) throw new Error("GitHub CLI is not authenticated. Run: gh auth login");

  const previewEnvironment = config.workflow?.previewEnvironment || "preview";
  const productionEnvironment = config.workflow?.productionEnvironment || "production";
  const productionBranch = config.workflow?.productionBranch || "prod";

  console.log(`\nWiring CI/CD for ${repo}...\n`);

  ensureGitHubEnvironment(repo, previewEnvironment, cwd);
  ensureGitHubEnvironment(repo, productionEnvironment, cwd);

  if (config.deployment?.githubPages?.enabled) {
    ensureGitHubPages(repo, cwd);
    console.log("✓ GitHub Pages uses GitHub Actions");
  }

  if (config.deployment?.cloudflare?.enabled) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      throw new Error("Cloudflare CI/CD is enabled. Export CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN, then run mira setup cicd again.");
    }

    setSecret(repo, "CLOUDFLARE_ACCOUNT_ID", accountId, cwd);
    setSecret(repo, "CLOUDFLARE_API_TOKEN", apiToken, cwd);
    console.log("✓ Cloudflare credentials stored as GitHub Actions secrets");

    for (const target of ["mobile", "pc"]) {
      if (!config.targets?.[target]) continue;
      const projectName = config.deployment.cloudflare.projects?.[target];
      if (!projectName) throw new Error(`Cloudflare project name missing for ${target}.`);
      const state = await ensureCloudflareProject(accountId, apiToken, projectName, productionBranch);
      console.log(`✓ Cloudflare ${target}: ${projectName} (${state})`);
    }
  }

  console.log("\nCI/CD is wired.\n");
  console.log(`  ${config.workflow?.developmentBranch || "dev"}  → ${previewEnvironment}`);
  console.log(`  ${productionBranch} → ${productionEnvironment}`);
  console.log("\nPush dev for preview; merge/promote to prod for production.\n");
}

const args = process.argv.slice(2);
const positional = args.filter(arg => !arg.startsWith("--"));

if (positional[0] === "create" && positional[1] === "prototype") {
  createPrototype(positional[2], args).catch(error => {
    console.error(`\nMira could not plant this prototype: ${error.message}\n`);
    process.exit(1);
  });
} else if (positional[0] === "setup" && positional[1] === "cicd") {
  setupCicd(args).catch(error => {
    console.error(`\nMira could not wire CI/CD: ${error.message}\n`);
    process.exit(1);
  });
} else {
  console.log(`Mira CLI\n\nUsage:\n  mira create prototype [name]\n  mira setup cicd [--repo=owner/name]\n\nCreate options:\n  --title=\"Product title\"\n  --targets=mobile,pc\n  --deploy=github,cloudflare\n  --no-install\n`);
}
