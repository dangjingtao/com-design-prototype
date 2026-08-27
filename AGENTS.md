# AGENTS.md

## 项目定位

这是由 Com Design Prototype Seed 生成的双端可交互产品原型。目标是快速验证产品结构、状态、动线和业务规则，而不是直接建设生产级系统。

## 开工前先读

1. `prototype.config.json`
2. `docs/product/00-product-brief.md`
3. `docs/workbench/00-work-ledger.md`
4. 当前任务卡

不要只看页面代码自行推导产品模型。

## 工作原则

1. 产品事实、推断、待决策事项要分开记录。
2. PC / Mobile 可以共享业务语义、类型、Token 与无端侧偏好的能力，但不要为了复用强行共用布局。
3. 中保真优先信息层级、关键状态、动线和可维护性，不为装饰牺牲清晰度。
4. 关键按钮不能是假按钮；后端未接通时使用可追踪的 mock / handoff。
5. 新功能先补产品文档或任务卡，再施工；施工结果同步回台账。
6. 修改前检查当前分支、相关文档与现有实现，避免覆盖并行工作。
7. 无法真实 typecheck / build / browser verify 时明确说明，不伪造通过。

## Design System

- 设计底座：Com Design。
- Token 从 `@prototype/design-system/tokens.css` 消费。
- Icon 从 `@prototype/icons` 使用语义名称，不在业务代码中散落自定义 SVG。
- mobile-first、compact-first、flat-first；普通 Card 不默认使用重阴影。
- 页面 edge inset 默认 16px；触控目标保持移动端可点击尺寸。

## Prototype Runtime

所有关键页面应考虑并尽量可触发：

- ready
- loading
- empty
- error
- permission

开发阶段允许用 URL query `?view=` 或 PrototypePanel 切换状态。

## Git / 台账

默认协作分支：

- `dev`：日常整合与验证
- `prod`：经过验收的生产预览

工作入口：`docs/workbench/00-work-ledger.md`。

任务卡建议位于 `docs/workbench/tasks/`，编号保持稳定，不因重排文档而改号。
