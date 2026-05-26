/** 微信小程序与支付配置（仅服务端读取） */

export function isWechatMiniConfigured(): boolean {
  return Boolean(
    process.env.WECHAT_MINI_APP_ID?.trim() &&
      process.env.WECHAT_MINI_APP_SECRET?.trim()
  );
}

export function getWechatMiniCredentials() {
  return {
    appId: process.env.WECHAT_MINI_APP_ID!.trim(),
    appSecret: process.env.WECHAT_MINI_APP_SECRET!.trim(),
  };
}

export function isWechatPayConfigured(): boolean {
  return Boolean(
    process.env.WECHAT_MCH_ID?.trim() &&
      process.env.WECHAT_API_V3_KEY?.trim() &&
      process.env.WECHAT_PAY_NOTIFY_URL?.trim() &&
      (process.env.WECHAT_MCH_SERIAL_NO?.trim() ||
        process.env.WECHAT_MCH_PRIVATE_KEY?.trim())
  );
}

export function getHotTopicsSubscribeTemplateId(): string | null {
  const id = process.env.WECHAT_SUBSCRIBE_HOT_TOPICS_TEMPLATE_ID?.trim();
  return id || null;
}
