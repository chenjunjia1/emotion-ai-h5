export class ExpressionApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number
  ) {
    super(code);
    this.name = "ExpressionApiError";
  }
}

export function expressionErrorMessage(code: string): string {
  switch (code) {
    case "unauthorized":
      return "请先登录后再生成";
    case "quota_insufficient":
      return "灵感不足，请充值或开通会员";
    case "vip_required":
      return "该功能为 Pro 会员专享，开通后即可使用";
    case "feature_limit":
      return "今日免费次数已用完，明天再来或升级会员";
    case "server_backend_disabled":
      return "服务未开启，请联系管理员";
    case "generate_failed":
      return "生成失败，请稍后重试";
    default:
      return "请求失败，请稍后重试";
  }
}
