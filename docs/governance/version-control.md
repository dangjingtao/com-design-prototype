# Version Control

## 目标

版本控制不是发布时才补的数字。Prototype 从第一天开始保留可追踪的产品基线，让需求、任务、代码、评审和部署都能回答：**这是哪一版？为什么变？从哪一版开始生效？**

## 版本号

使用 Semantic Versioning：`MAJOR.MINOR.PATCH`。

原型项目默认从 `0.1.0` 开始：

- `PATCH`：修复、文案、样式微调、无合同变化的工程调整
- `MINOR`：新增可验证能力、页面、流程、状态或明显产品能力
- `MAJOR`：进入稳定版后发生不兼容的产品 / 数据 / API / 工程合同变化

`0.x` 阶段允许快速迭代，但仍要记录破坏性变化。

## 真相源

- `VERSION`：当前版本号，人类和脚本都可直接读取
- `package.json.version`：npm / Node 工程版本，必须与 `VERSION` 一致
- `CHANGELOG.md`：为什么变化
- `docs/workbench/00-work-ledger.md`：哪些任务进入哪一版
- Git tag：已经形成明确发布 / 验收基线的版本

任何一个版本升级都至少同时修改：

1. `VERSION`
2. `package.json.version`
3. `CHANGELOG.md`

## 分支合同

### `dev`

日常集成与验证分支：

- 产品施工
- PC / Mobile 联调
- CI
- preview deployment
- AI / 人工 review 前的集成

允许直接推进快速原型，但高风险、并行或跨端任务建议使用短生命周期任务分支，例如：

```text
task/T023-campus-team
fix/T031-empty-state
```

完成后合回 `dev`。

### `prod`

明确验收后的发布 / 正式预览分支：

- 不作为日常施工分支
- 进入 `prod` 的内容应已有 `REVIEW → PASS` 证据
- CI 绿只是必要条件，不是充分验收条件
- production deployment 从该分支产生

## 发布与 Tag

当某个版本形成可复现的验收基线：

```bash
git tag v0.3.0
git push origin v0.3.0
```

Tag 名必须与 `VERSION` 一致。

## Commit 约定

建议使用简洁前缀：

- `feat:` 新能力
- `fix:` 修复
- `docs:` 文档
- `refactor:` 不改变产品行为的重构
- `test:` 测试 / 回归
- `chore:` 工具链 / 基础设施维护

任务相关提交建议在正文或标题中带稳定任务号，例如：

```text
feat: T023 add team performance prototype
```

不要求为了格式牺牲可读性。

## CHANGELOG 规则

每个版本记录：

- Added
- Changed
- Fixed
- Removed（如有）
- Breaking / Migration（如有）

只记录对产品验证、协作合同、部署或工程行为有意义的变化；不要把每个 commit 原样复制进去。

## AI 权限

AI 可以：

- 读取当前版本并判断任务目标版本
- 建议版本升级类型
- 更新 `CHANGELOG.md`
- 在获得授权时同步 `VERSION` / `package.json.version`

AI 默认不可以：

- 仅因为代码完成就擅自发布新版本
- 未经确认直接把 `dev` 推进 `prod`
- 擅自创建 production tag

是否允许自动版本推进，应在 `docs/ai/skills.md` 中明确确认。

## 回滚

原型遇到问题时优先通过 Git commit / tag 回滚，不用覆盖历史文件制造“看起来没发生过”的状态。

如果产品结论被推翻：

1. 保留原任务 / 决策记录
2. 新增替代结论
3. 在 CHANGELOG / 台账写清影响版本
4. 必要时新增任务完成迁移或回退
