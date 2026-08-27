# Prototype Work Ledger

> 统一记录产品决策、施工、评审和验证。路由存在不等于产品闭环存在；页面能看不等于业务已确认；CI 通过不等于产品验收通过。

## 当前基线

- Product Brief：`docs/product/00-product-brief.md`
- AI Skills：`docs/ai/skills.md`
- Daily Report Skill：`docs/ai/skills/daily-report.md`
- 日报目录：`docs/reports/daily/`
- 版本：`VERSION`
- 默认施工分支：`dev`
- 验收 / 发布分支：`prod`
- 业务项目不使用 `main` 作为工作分支

## 默认规则

1. 可执行工作使用稳定编号，如 `T001`；编号创建后永久保留，不复用。
2. 简单、低风险任务可以只在总台账记录；出现以下任一情况必须创建独立任务卡：
   - 跨 PC / Mobile
   - 多步骤施工
   - 涉及产品决策或规则变化
   - 存在明显风险 / 依赖
   - 需要独立验收标准
3. 默认状态流：`TODO → DOING → REVIEW → PASS`。
4. 任意执行态均可进入 `BLOCKED`；取消任务使用 `CANCELLED`，不得删除历史。
5. AI 可以创建任务、更新进度并推进到 `REVIEW`；除非用户明确授权自动验收，否则 AI 不得自行把任务改成 `PASS`。
6. 每次状态变化至少留一个证据：commit / PR / 页面路径 / 截图说明 / CI run / 明确评审结论之一。
7. 需求变化不得覆盖旧结论；在“变更记录”中写明旧结论、替代结论和影响范围。
8. 产品事实变化时同步更新 Product Brief / 决策记录 / 任务卡中的至少一个真相源。
9. 版本变化遵循 `docs/governance/version-control.md`，并同步 `VERSION` 与 `CHANGELOG.md`。
10. 日报是“实际改动的聚合视图”，不是新的任务真相源；日报发现 commit 与台账不一致时，应记录偏差，而不是静默改写历史。

## 总状态

| 卡片 | 主题 | 类型 | 状态 | 目标版本 | 前置 | 证据 / 结果 |
| --- | --- | --- | --- | --- | --- | --- |
| T001 | 第一条核心动线 | 产品 / 施工 | TODO | 0.1.0 | Product Brief |  |

## 状态约定

- `TODO`：目标与范围已足够进入施工，但尚未开始
- `DOING`：正在施工
- `BLOCKED`：依赖产品决定、外部条件或前置任务
- `REVIEW`：施工方已完成自检，等待独立评审 / 用户确认
- `PASS`：验收通过；必须有明确验收证据
- `CANCELLED`：任务不再执行，但历史继续保留

## 任务卡最低内容

独立任务卡至少包含：

- ID / 标题
- 背景与目标
- 范围 / 非范围
- 验收标准
- 影响端：PC / Mobile / Shared / CI/CD / Docs
- 风险与依赖
- 验证方式
- 施工结果与证据
- Review 结论

## 日报对账

执行 Daily Report Skill 时：

- 默认以当天 `dev` commit 为实际施工主线。
- 当天 `prod` 有发布 / 合并时同时纳入。
- commit 有改动但没有任务归属：记为“未归档改动”。
- 任务卡标记完成但缺少实际证据：记为“状态待核验”。
- commit 与任务卡内容不一致：记为“台账偏差”。
- 日报不得自行把任务从 `REVIEW` 提升为 `PASS`。

## 变更记录

### YYYY-MM-DD

- 新增：
- 决策：
- 施工：
- 评审：
- 风险：
- 版本：

## 下一步

1. 填完 Product Brief。
2. 通过 AI 交互式问答确认 `docs/ai/skills.md`；如使用 GitHub，可直接贴 repository URL。
3. 确认是否启用 `daily-report`。
4. 把 T001 改成真实任务。
5. 需要详情时在 `docs/workbench/tasks/` 建稳定编号任务卡。
