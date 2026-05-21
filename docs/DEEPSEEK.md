# DeepSeek API 配置（3 步）

## 1. 申请 API Key

1. 打开 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 注册 / 登录（支持手机号或邮箱）
3. 左侧 **API Keys** → **创建 API Key**
4. 复制以 **`sk-`** 开头的密钥（只显示一次，请保存好）

## 2. 写入 `.env.local`

打开 `e:\emotion-ai-h5\.env.local`，修改第 2 行：

```env
DEEPSEEK_API_KEY=sk-粘贴你的完整密钥
```

保存文件（`Ctrl + S`）。

## 3. 验证并启动

```bash
npm run check:env
npm run test:deepseek
npm run dev
```

- `check:env` 里 DeepSeek 显示 ✅  
- `test:deepseek` 显示「连接成功」  
- 浏览器生成页点 **AI 生成**，内容为 AI 撰写（非固定 Mock 模板）

## 常见问题

| 报错 | 处理 |
|------|------|
| 401 Unauthorized | Key 错误或过期，重新创建并粘贴 |
| 402 / Insufficient Balance | **账户余额不足**，到 [platform.deepseek.com](https://platform.deepseek.com) → 充值；充值前项目会自动用演示数据 |
| 仍像 Mock 文案 | 确认已保存 `.env.local` 并重启 `npm run dev` |
