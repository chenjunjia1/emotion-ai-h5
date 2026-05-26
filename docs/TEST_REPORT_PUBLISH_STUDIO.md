# AI 发布包工作室 — 测试报告

> 本地开发版本，**未推送生产**（按需求）。

## 功能范围

| 模块 | 说明 |
|------|------|
| 左栏 | 快速/高级模式、输入、灵感标签、AI猜你适合、生成按钮、免费次数 |
| 右栏 | 爆款指数、标题×5、配图×4、正文×3、标签×10、发布建议、底部操作 |
| 生成动画 | 6 步步骤蒙层 |
| 服务层 | `publishPackageService.ts`、`imageService.ts` |
| API | `/api/v1/publish-package/quick|images|restyle` |
| Admin | 工作室配置只读展示 |
| Legacy | `?legacy=1` 保留旧两步向导 |

## 正向用例

| ID | 步骤 | 预期 |
|----|------|------|
| P1 | 打开 `/publish-pack` | 双栏工作室 UI（宽屏 max-w-5xl） |
| P2 | 输入「今天下班好累」 | 出现 AI 猜你适合 5 项标签 |
| P3 | 点灵感标签 | 填入输入框并更新 guess |
| P4 | 点「帮我直接出图文」 | 6 步动画 → 右侧完整结果 |
| P5 | 复制标题/正文/标签 | Toast 已复制 |
| P6 | 换一组配图 | 扣 20 灵感（服务端）或演示替换 |
| P7 | 保存发布包 | 出现在 `/history?filter=pack` |
| P8 | 复盘跳转带 `from_review` | 带入选题与补充说明 |
| P9 | `/publish-pack?legacy=1` | 旧版创建发布包流程 |

## 反向用例

| ID | 步骤 | 预期 |
|----|------|------|
| N1 | 未登录点生成 | 弹出登录 |
| N2 | 灵感不足 | 弹出充值/会员 |
| N3 | 输入少于 2 字点生成 | Toast 提示 |
| N4 | 未配置 FAL/OpenAI | 使用 Pexels/封面 seed 占位，不报错 |
| N5 | 选场景（AI助手）不点发送 | 不消耗灵感（见上轮改动） |

## 自动化

```bash
npm run typecheck
npm run test:regression
```

## 环境变量（可选）

```env
FAL_KEY=
OPENAI_API_KEY=
PEXELS_API_KEY=
DEEPSEEK_API_KEY=
```

## 已知限制（V1）

- 封面文字叠加（渐变字/描边）为文案字段，尚未做 Canvas 合成图
- Pro 每日免费配图次数 UI 展示，扣费逻辑仍走统一灵感余额
- 高级模式部分表单项与 guess 字段映射为简化版
