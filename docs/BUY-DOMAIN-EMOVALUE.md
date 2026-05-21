# 第 1 步详解：购买 emovalue.com

目标：拥有域名 **emovalue.com**，之后才能在 Vercel 绑定 `https://emovalue.com`。

以下任选 **一个平台** 即可（推荐国内用户用 **阿里云**，海外/便宜用 **Cloudflare**）。

---

## 购买前准备

- 准备 **支付宝 / 微信 / 信用卡**
- 准备 **邮箱**（收验证邮件）
- 如需国内实名：准备 **身份证**（阿里云、腾讯云通常要实名）

---

## 方案 A：阿里云（国内用户最熟悉）

### A-1. 注册 / 登录

1. 打开 [https://wanwang.aliyun.com](https://wanwang.aliyun.com) 或搜索「阿里云 域名注册」
2. 用淘宝 / 支付宝账号登录
3. 若提示 **实名认证**：按页面完成个人实名（一般几分钟）

### A-2. 查询域名

1. 首页搜索框输入：**`emovalue.com`**
2. 点击 **查询**
3. 看结果：
   - **可注册** → 显示价格（`.com` 常见约 ¥55～75/首年）
   - **已注册** → 需换名字或联系当前持有人购买（一般不建议）

### A-3. 加入购物车并付款

1. 在 `emovalue.com` 一行点 **加入清单** / **立即购买**
2. 购买时长：选 **1 年** 即可（以后可续费）
3. **域名持有者** 填你自己（个人）或公司
4. **DNS 服务器**：先选 **阿里云默认 DNS**（后面绑 Vercel 时再改）
5. 提交订单 → **支付**
6. 支付成功 → 进入 **控制台 → 域名 → 域名列表**，能看到 `emovalue.com` 状态为 **正常**

### A-4. 买完后你要记下

- 域名：`emovalue.com`
- 登录阿里云 → **域名控制台** 能管理 DNS（第 3 步绑 Vercel 时用）

---

## 方案 B：Cloudflare（价格透明、绑 Vercel 方便）

### B-1. 注册账号

1. 打开 [https://www.cloudflare.com](https://www.cloudflare.com)
2. **Sign Up** → 用邮箱注册并验证

### B-2. 购买域名

1. 登录后左侧或顶部进入 **Domain Registration** / **Register domains**
   - 或直接打开：[https://domains.cloudflare.com](https://domains.cloudflare.com)
2. 搜索 **`emovalue.com`**
3. 若 **Available**，看价格（`.com` 约 $10～12/年，按汇率折算）
4. 点 **Purchase** / **Add to cart**
5. 填写 **Contact information**（姓名、地址、邮箱，按真实信息填）
6. 选择购买年限 → 付款（支持信用卡等）

### B-3. 买完后

- 域名会出现在 Cloudflare **Account → Domains**
- 默认 DNS 就在 Cloudflare，后面绑 Vercel 时改记录很方便

---

## 方案 C：Namecheap（英文界面、常用）

### C-1. 注册

1. 打开 [https://www.namecheap.com](https://www.namecheap.com)
2. **Sign Up** 注册账号

### C-2. 搜索并购买

1. 首页搜索 **`emovalue.com`**
2. 显示 **$8.xx/yr** 等价格且为 **ADD TO CART**
3. 购物车 → 取消不需要的附加项（如隐私保护可选 WhoisGuard）
4. **Confirm Order** → 付款（PayPal / 信用卡）

### C-3. 买完后

- **Domain List** 里能看到 `emovalue.com`
- **Nameservers** 可先保持 Namecheap BasicDNS，第 3 步再按 Vercel 要求修改

---

## 买域名时常见选项怎么选

| 选项 | 建议 |
|------|------|
| 购买年限 | 先买 **1 年** |
| 隐私保护 / Whois | 可选，个人建议开启（隐藏手机号） |
| 邮箱套餐 | **不要买**，用不到 |
| 建站套餐 | **不要买**，我们用 Vercel 托管 |
| DNS | 先用平台 **默认 DNS**，第 3 步再改 |

---

## 如何确认已经买成功

满足下面任意一条即可进行 **第 2 步 Vercel 部署**：

- [ ] 阿里云域名列表里有 `emovalue.com`，状态正常  
- [ ] Cloudflare Domains 里有 `emovalue.com`  
- [ ] Namecheap Domain List 里有 `emovalue.com`  

在浏览器访问 `http://emovalue.com` 此时 **还打不开网站是正常的**（还没部署、没绑 DNS）。

---

## 域名已被别人注册怎么办

若三家都显示 **Unavailable / 已注册**：

备选域名（可再搜）：

- `emovalue.app`
- `getemovalue.com`
- `myemovalue.com`
- `emovalue.cn`（需实名，偏国内）

选定后告诉我，项目文档里的域名可一起改。

---

## 买完后下一步

1. **第 2 步**： [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — 部署到 Vercel  
2. **第 3 步**： [DOMAIN-EMOVALUE.md](./DOMAIN-EMOVALUE.md) — 在 Vercel 绑定 `emovalue.com`  

---

## 你卡在哪可以对照

| 现象 | 处理 |
|------|------|
| 要实名认证 | 阿里云/国内注册商正常流程，用身份证完成 |
| 搜索显示溢价/domain premium | 价格很高说明优质词，可看是否接受或换 `.app` |
| 付完款列表里没有域名 | 等 5～10 分钟刷新，或查订单 / 联系客服 |
| 不会英文 Namecheap | 优先用 **阿里云** 方案 A |
