/** 管理员手机号白名单（逗号分隔，仅服务端读取） */
export function getAdminMobiles(): Set<string> {
  const raw = process.env.ADMIN_MOBILES?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,，\s]+/)
      .map((m) => m.trim())
      .filter(Boolean)
  );
}

export function isAdminMobile(mobile: string): boolean {
  const list = getAdminMobiles();
  if (list.size > 0) return list.has(mobile);
  return false;
}
