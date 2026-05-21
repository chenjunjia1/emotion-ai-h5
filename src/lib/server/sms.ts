import { getSmsProvider } from "@/lib/server/config";

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** 发送登录验证码；开发模式不真实发短信 */
export async function sendLoginSms(mobile: string): Promise<{ code: string; dev: boolean }> {
  const code = randomCode();
  const provider = getSmsProvider();

  if (provider === "aliyun") {
    const ok = await sendAliyunSms(mobile, code);
    if (!ok) throw new Error("sms_send_failed");
    return { code, dev: false };
  }

  console.info(`[sms:dev] mobile=${mobile} code=${code}`);
  return { code, dev: true };
}

async function sendAliyunSms(mobile: string, code: string): Promise<boolean> {
  const id = process.env.ALIYUN_SMS_ACCESS_KEY_ID;
  const secret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET;
  const sign = process.env.ALIYUN_SMS_SIGN_NAME;
  const template = process.env.ALIYUN_SMS_TEMPLATE_CODE;

  if (!id || !secret || !sign || !template) {
    console.error("[sms] aliyun env incomplete");
    return false;
  }

  // 生产环境请接入 @alicloud/dysmsapi20170525 或官方 REST；此处为占位，避免未配置时误上线
  console.warn(
    "[sms] ALIYUN: install SDK and implement send — see docs/PRODUCTION-运营上线清单.md"
  );
  void mobile;
  void code;
  return false;
}
