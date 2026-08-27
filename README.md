# Com Design Prototype

**Mira plants. Com Design shapes. Prototype proves.**

用于快速产品开发与验证的双端种子项目。它不是业务模板，而是一套可以被 Mira 快速生成、被 AI 直接施工、被产品人员快速验证，并能直接进入 CI/CD 的原型运行环境。

## 能力

- PC + Mobile 双端 React / TypeScript / Vite
- Com Design 基础 Design Tokens
- Lucide 语义 Icon registry
- Prototype Runtime：ready / loading / empty / error / permission 等状态快速切换
- Git 内产品文档、工作台账、任务卡协议
- `AGENTS.md` AI 协作边界
- CI：install / typecheck / build / CLI smoke test
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
| Pull Request | typecheck + build + CLI smoke |
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
  product/
  workbench/
cli/
.github/workflows/
prototype.config.json
```

## 原则

1. 原型首先验证产品结构、状态、动线和业务规则，不追求生产级后端。
2. PC / Mobile 共享语义和 Token，不强行共享不适合的布局。
3. Icon 使用语义名，业务页面不与某个 SVG 锁死。
4. 产品结论、任务、施工和评审留在 Git 中，避免第二套真相源。
5. 所有关键状态都应能在 Prototype Runtime 中被人工触发。
6. 部署配置可以入库，凭据永远不入库。
