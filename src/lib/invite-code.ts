export function makeInviteCode(mobile: string, userId: string): string {
  const tail = mobile.slice(-4);
  const idPart = userId.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `SV${tail}${idPart}`;
}
