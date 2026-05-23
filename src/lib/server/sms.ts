import Dysmsapi20170525, { SendSmsRequest } from "@alicloud/dysmsapi20170525";
import { Config } from "@alicloud/openapi-client";
import { MOCK_SMS_CODE } from "@/lib/constants/v1";
import { getSmsProvider } from "@/lib/server/config";

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** 发送登录验证码 */
export async function sendLoginSms(mobile: string): Promise<{ code: string; dev: boolean }> {
  const provider = getSmsProvider();

  if (provider === "aliyun") {
    const code = randomCode();
    const ok = await sendAliyunSms(mobile, code);
    if (!ok) throw new Error("sms_send_failed");
    return { code, dev: false };
  }

  const code = MOCK_SMS_CODE;
  console.info(`[sms:dev] mobile=${mobile} code=${code}`);
  return { code, dev: true };
}

async function sendAliyunSms(mobile: string, code: string): Promise<boolean> {
  const accessKeyId = process.env.ALIYUN_SMS_ACCESS_KEY_ID?.trim();
  const accessKeySecret = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET?.trim();
  const signName = process.env.ALIYUN_SMS_SIGN_NAME?.trim();
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE?.trim();

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
    console.error("[sms] aliyun env incomplete");
    return false;
  }

  try {
    const config = new Config({
      accessKeyId,
      accessKeySecret,
      endpoint: "dysmsapi.aliyuncs.com",
    });
    const client = new Dysmsapi20170525(config);
    const request = new SendSmsRequest({
      phoneNumbers: mobile,
      signName,
      templateCode,
      templateParam: JSON.stringify({ code }),
    });
    const resp = await client.sendSms(request);
    const ok = resp.body?.code === "OK";
    if (!ok) {
      console.error("[sms] aliyun send failed", resp.body?.code, resp.body?.message);
    }
    return ok;
  } catch (err) {
    console.error("[sms] aliyun error", err);
    return false;
  }
}
