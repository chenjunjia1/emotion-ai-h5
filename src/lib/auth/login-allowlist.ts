import { MOCK_SMS_CODE } from "@/lib/constants/v1";

/** 内测阶段仅允许该手机号登录（H5 短信登录） */
export const PILOT_LOGIN_MOBILE = "13798221796";

const PILOT_MOBILES = new Set([PILOT_LOGIN_MOBILE]);

export function isPilotLoginMobile(mobile: string): boolean {
  return PILOT_MOBILES.has(mobile.trim());
}

/** 内测号可用固定验证码 1234，不依赖短信是否过期 */
export function isPilotSmsBypass(mobile: string, code: string): boolean {
  return isPilotLoginMobile(mobile) && code.trim() === MOCK_SMS_CODE;
}

export function assertPilotLoginMobile(mobile: string): boolean {
  return isPilotLoginMobile(mobile);
}

/** 是否展示运营后台入口（仅内测管理员手机号） */
export function canAccessOpsAdmin(user: { mobile?: string } | null | undefined): boolean {
  return Boolean(user?.mobile && isPilotLoginMobile(user.mobile));
}
