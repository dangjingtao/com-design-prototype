# Com Design Prototype

**Mira plants. Com Design shapes. Prototype proves.**

用于快速产品开发与验证的双端种子项目。它不是业务模板，而是一套可以被 Mira 快速生成、被 AI 直接施工、被产品人员快速验证，并能直接进入 CI/CD 的原型运行环境。

Authors: **Tomz <dangjingtao@gmail.com> & Mira <mira@tomz.io>**

Current Seed Version: **0.2.0**

## First Review

一个新项目进入实质性施工前，优先评审这四项：

1. `AGENTS.md`：AI 施工与 Review 边界
2. `VERSION` + `CHANGELOG.md` + `docs/governance/version-control.md`：版本控制
3. `docs/workbench/00-work-ledger.md` + `docs/workbench/tasks/README.md`：默认台账与任务卡规则
4. `docs/ai/skills.md`：通过 AI 交互式问答确认本项目的技能、工具和权限

其中 AI Skills 默认状态为 `PENDING`。不要让模板替用户决定 AI 的角色和权限；AI 应在首次实质性施工前通过自然问答完成确认，再将 Skill Profile 更新为 `CONFIRMED`。

## 能力

- PC + Mobile 双端 React / TypeScript / Vite
- Com Design 基础 Design Tokens
- Lucide 语义 Icon registry
- Prototype Runtime：ready / loading / empty / error / permission 等状态快速切换
- Git 内产品文档、工作台账、任务卡协议
- `AGENTS.md` AI 协作 / Review 边界
- SemVer + VERSION + CHANGELOG 版本基线
- AI Skill Interview + Project Skill Profile
- CI：install / version contract / typecheck / build / CLI smoke test
- CD：`dev` Cloudflare preview，`prod` Cloudflare production + GitHub Pages
- `mira create prototype` 项目生成器
- `mira setup cicd` CI/CD bootstrap

## 创建项目

```bash
npm install -g github:dangjingtao/com-design-prototype
mira create prototype
```

CLI 会询问项目名、产品名、端侧和部署方式。

也可以直接参数化，适合 AI / shell：

```bash
mira create prototype demo \
  --title="Demo Product" \
  --targets=mobile,pc \
  --deploy=github,cloudflare
```

只生成 Mobile：

```bash
mira create prototype demo-mobile \
  --title="Demo Mobile" \
  --targets=mobile \
  --deploy=github
```

如只想生成文件、不立即安装依赖，加 `--no-install`。

生成出的业务项目使用自己的版本线，默认从 `0.1.0` 开始；Seed 版本会记录在 `prototype.config.json.versioning.seedVersion`，不会混用。

## AI Skill Interview

生成项目后第一次让 AI 实质施工时，可以直接说：

```text
先按 AGENTS.md 做项目评审，并通过问答和我确认 AI Skills。
```

AI 会逐步确认：

- 它在项目里承担什么角色
- 允许使用哪些工具 / Connector
- 是否允许直接改代码、台账、commit、PR、部署
- 当前最重要的验证目标
- 明确禁止越界的事项
- 是否需要项目专属 Skill

最终结果落在 `docs/ai/skills.md`，而不是只存在聊天记录里。

## CI/CD

生成项目后先推到 GitHub。项目默认从 `dev` 分支开始。

如果启用了 Cloudflare：

```bash
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_API_TOKEN="..."
```

然后在项目目录执行：

```bash
mira setup cicd
```

它会：

1. 检测当前 GitHub repository。
2. 创建 `preview` / `production` GitHub deployment environments。
3. 如果启用了 GitHub Pages，将 Pages 发布源设置为 GitHub Actions。
4. 如果启用了 Cloudflare，将账号 ID / API Token 写入 GitHub Actions Secrets。
5. 为已启用的 Mobile / PC 创建独立 Cloudflare Pages project。

Cloudflare 凭据只从当前 shell 读取，不写入仓库文件。

### 分支合同

| Git 动作 | CI/CD |
| --- | --- |
| Pull Request | version contract + typecheck + build + CLI smoke |
| push `dev` | CI + Cloudflare preview |
| push `prod` | CI + Cloudflare production + GitHub Pages production |

正式发布可以保持非常简单：

```bash
git switch prod
git merge dev
git push origin prod
```

如果还没有 `prod`：

```bash
git switch -c prod
git push -u origin prod
```

注意：**CI 通过不等于任务 PASS**。任务必须满足验收标准并有明确 Review evidence；AI 默认只能推进到 `REVIEW`。

## 版本控制

Seed 和生成项目都遵循 SemVer。

```text
VERSION
package.json.version
prototype.config.json.versioning.currentVersion
```

三者必须保持一致；版本升级同时更新 `CHANGELOG.md`。发布基线使用 `vX.Y.Z` tag。

详细规则见 `docs/governance/version-control.md`。

## Seed 开发

```bash
git clone https://github.com/dangjingtao/com-design-prototype.git
cd com-design-prototype
npm install
npm link

npm run dev:mobile
npm run dev:pc
npm run typecheck
npm run build
```

## 目录

```text
apps/
  mobile/
  pc/
packages/
  design-system/
  icons/
  prototype-runtime/
  shared/
docs/
  ai/
  governance/
  product/
  workbench/
cli/
.github/workflows/
VERSION
CHANGELOG.md
AUTHORS
prototype.config.json
```

## 原则

1. 原型首先验证产品结构、状态、动线和业务规则，不追求生产级后端。
2. PC / Mobile 共享语义和 Token，不强行共享不适合的布局。
3. Icon 使用语义名，业务页面不与某个 SVG 锁死。
4. 产品结论、任务、施工和评审留在 Git 中，避免第二套真相源。
5. 所有关键状态都应能在 Prototype Runtime 中被人工触发。
6. 部署配置可以入库，凭据永远不入库。
7. AI 的技能和权限必须经过用户确认，不由 Seed 静默扩权。
