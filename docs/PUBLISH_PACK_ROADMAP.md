# AI 发布包产品路线

## 当前默认入口

- **URL**：`/publish-pack`（默认 **V2**）
- **遗留**：`/publish-pack?legacy=1`（旧版多步向导，仅维护）
- **工作室**：`/publish-pack?studio=1`（换图 / 换风格 / 素材库，能力逐步并入 V2）

## V2 已具备

- 快速文案包（无图）+ 高级图文包（火山方舟 Seedream / 星绘）
- 画面预设标签 → 英文 prompt 拼接
- 服务端扣费、失败退款、配额预检 `GET /api/v1/publish-package/quota-preview`
- 结果页：复制、文案 restyle、单张换图、升级张数
- 付费弹窗 → `createOrder` / 支付宝（非 Mock 加灵感）

## 合并计划（Studio → V2）

| Studio 能力 | V2 状态 | 说明 |
|-----------|---------|------|
| 单张换图 | ✅ 已接入 | `POST /api/v1/publish-package/images` action=regenerate_one |
| 文案 restyle | ✅ 已接入 | `POST /api/v1/publish-package/restyle` |
| 整组换图 | 🔲 待并入 | 结果区「换一组图」按钮 |
| 保存素材库 | 🔲 待并入 | 与历史库 / favorites 统一 |
| 朋友圈专属视图 | 🔲 可选 | `moments-result-view` 按平台分支 |

## 定价单一来源

- 展示与按钮：`src/lib/publish-pack/quota-display.ts`
- 扣费规则：`src/lib/publish-pack/pack-pricing.ts` + `src/services/quotaService.ts`
- 订单商品：`src/lib/constants/v1.ts` `PRODUCTS`

## 运维

- 生产环境禁用：`/api/dev/*`
- 数据库：执行 `supabase/migrations/012_deduct_quota_atomic.sql` 启用原子扣费 RPC
