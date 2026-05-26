/** 是否允许客户端「模拟支付」快捷加灵感（仅本地演示） */
export function isDevMockPayEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BACKEND_MODE !== "server"
  );
}
