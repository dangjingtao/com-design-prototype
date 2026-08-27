# Com Design Prototype

**Mira plants. Com Design shapes. Prototype proves.**

用于快速产品开发与验证的双端种子项目。它不是业务模板，而是一套可以被 Mira 快速生成、被 AI 直接施工、被产品人员快速验证的原型运行环境。

## 能力

- PC + Mobile 双端 React / TypeScript / Vite
- Com Design 基础 Design Tokens
- Lucide 语义 Icon registry
- Prototype Runtime：ready / loading / empty / error / permission 等状态快速切换
- Git 内产品文档、工作台账、任务卡协议
- `AGENTS.md` AI 协作边界
- Typecheck / Build / GitHub Actions
- GitHub Pages 双端预览
- Cloudflare Pages 双端独立部署
- `mira create prototype` 项目生成器

## 今天就用

```bash
npm install -g github:dangjingtao/com-design-prototype
mira create prototype
```

也可以先克隆本仓库开发 CLI：

```bash
git clone https://github.com/dangjingtao/com-design-prototype.git
cd com-design-prototype
npm link
mira create prototype
```

生成器会询问项目名、产品名、端侧与部署方式，并创建一个新的独立 Git 仓库。

## Seed 开发

```bash
npm install
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
