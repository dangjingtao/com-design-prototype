# AI Skill Profile

Status: `PENDING`

> 本文件不由 Seed 预设最终答案。项目第一次进入实质性 AI 协作前，应由 AI 与用户通过交互式问答确认，再更新为 `CONFIRMED`。

## 为什么存在

不同原型对 AI 的要求不一样。有的项目需要产品拆解 + 双端 UI + 前端施工，有的只需要快速页面验证；有的允许 AI 直接提交和部署，有的只允许给建议。

因此技能不是模板里的固定开关，而是一份经过用户确认的项目协作合同。

## AI Skill Interview

AI 应自然地逐步确认，不要一次抛出长表单。优先围绕当前项目最关键的 1–2 个问题开始。

### 0. 项目仓库

如果项目使用 GitHub，询问用户是否已有仓库。

- 已有：允许用户直接在对话中粘贴 GitHub repository URL。
- 尚无：保留 `prototype.config.json.repository.url = null`，不要强迫用户先创建仓库。

拿到 URL 后：

1. 校验它确实指向预期 GitHub repository。
2. 写入 `prototype.config.json.repository.url`。
3. 只有在用户允许修改 Git 配置时，才设置 / 更新 `origin`。
4. 业务项目长期分支只使用 `dev` / `prod`，不建立 `main` 工作流。

### 1. AI 角色

可选但不限于：

- Product Discovery / PRD
- Requirement Review
- UI / Interaction Design
- Frontend Implementation
- PC / Mobile Adaptation
- Design System Compliance
- Test / Regression
- Code Review
- Documentation
- Git / Release
- CI/CD / Deployment

### 2. 工具与连接

确认是否允许使用：

- GitHub
- 浏览器 / Web Research
- Figma / Penpot / 设计源
- Cloudflare
- GitHub Pages
- 其他项目工具 / MCP / Connector

### 3. AI 自主权限

逐项确认 AI 是否可以：

- 修改代码
- 修改产品文档
- 创建 / 更新任务卡与台账
- commit / push
- 创建 PR
- 合并 PR
- 修改版本号 / CHANGELOG
- 触发或配置 CI/CD
- 部署 preview
- 部署 production

### 4. 验证目标

记录当前项目最重要的验证目标，例如：

- 核心业务闭环
- 信息架构
- 运营活动规则
- 双端一致性
- 视觉方向
- 数据状态
- 用户测试

### 5. 禁止越界

记录明确禁止事项，例如：

- 不建设生产级后端
- 不自行改变产品规则
- 不新增未经确认的业务需求
- 不更换设计系统
- 不直接发布 production

### 6. 项目专属技能

Seed 内置可供确认的 Skill：

- `daily-report`：根据当天 commit + 台账 / 任务卡实际情况生成项目日报，规则见 `docs/ai/skills/daily-report.md`。

也可以根据项目需要增加其他稳定名称，例如：

- `product-review`
- `mobile-prototype`
- `pc-console`
- `com-design-review`
- `regression-check`
- `release-guard`

除了 Seed 已提供的能力外，其余名字只是建议，不代表默认启用。

对于 `daily-report`，至少确认：

- 是否启用
- 日报面向谁阅读
- 是否允许 AI 仅生成 Markdown，还是也允许自动 commit / push
- 如本地日期 / 工作时区不明确，使用哪个时区作为“当天”边界

---

## Confirmed Profile

> 由 AI 在用户确认后填写。

- Status: `PENDING`
- Confirmed at: -
- Confirmed by: -
- Project goal: -
- GitHub repository: -

### Confirmed skills

- -

### Allowed tools

- -

### Allowed autonomous actions

- -

### Requires explicit approval

- -

### Project-specific constraints

- -

### AI recommendations not yet confirmed

- -

## Re-confirmation

出现以下情况时，把 Status 改成 `REVIEW_REQUIRED` 并重新问答：

- 产品阶段明显变化
- AI 获得新的写入 / 发布权限
- 新接入外部工具或账号
- GitHub repository / 分支策略发生变化
- 从 prototype 进入 production engineering
- 用户明确要求重做技能配置

AI 不得在没有用户确认的情况下静默扩大权限或新增关键技能。
