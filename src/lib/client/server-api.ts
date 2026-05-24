import type { HotTopicItem } from "@/lib/hot-topics/types";
import type {
  HistoryItem,
  Order,
  ProductDef,
  RiskResult,
  User,
  VideoTask,
} from "@/lib/types/v1";
import type { I18nKey } from "@/lib/i18n";
import type { HeatLevel } from "@/lib/content/heat-level";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types/v1";

export function isClientServerMode(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_MODE === "server";
}

export async function apiSendCode(
  mobile: string
): Promise<{ ok: boolean; dev?: boolean; devCode?: string; error?: string }> {
  const res = await fetch("/api/auth/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "send_failed" };
  return {
    ok: true,
    dev: Boolean(data.dev),
    devCode: data.devCode ? String(data.devCode) : undefined,
  };
}

export function loginErrorMessage(error: string | undefined, lang: Lang = "zh"): string {
  const key: I18nKey =
    error === "code_expired"
      ? "codeExpired"
      : error === "code_invalid"
        ? "codeError"
        : "codeError";
  return t(lang, key);
}

export async function apiLogin(
  mobile: string,
  code: string,
  inviteCode?: string
): Promise<{ ok: boolean; user?: User; isNewUser?: boolean; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, code, inviteCode }),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "login_failed" };
  return {
    ok: true,
    user: data.user as User,
    isNewUser: Boolean(data.isNewUser),
  };
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<User | null> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.user as User) || null;
}

export async function apiMeSync(): Promise<{
  user: User | null;
  unauthorized?: boolean;
  orders?: Order[];
  tasks?: VideoTask[];
  histories?: HistoryItem[];
}> {
  const res = await fetch("/api/me?sync=1", { credentials: "include" });
  if (res.status === 401) return { user: null, unauthorized: true };
  if (!res.ok) return { user: null };
  const data = await res.json();
  return {
    user: (data.user as User) || null,
    orders: data.orders as Order[] | undefined,
    tasks: data.tasks as VideoTask[] | undefined,
    histories: data.histories as HistoryItem[] | undefined,
  };
}

export async function apiCreateVideoTask(input: {
  taskType: "avatar" | "auto";
  script: string;
  duration: 30 | 60;
}): Promise<{
  task?: VideoTask;
  user?: User;
  risk?: RiskResult;
  error?: string;
}> {
  const res = await fetch("/api/v1/video/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk, user: data.user };
  return { task: data.task, user: data.user, risk: data.risk };
}

export async function apiPollVideoTasks(): Promise<{
  tasks?: VideoTask[];
  user?: User;
  error?: string;
}> {
  const res = await fetch("/api/v1/video/tasks", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { tasks: data.tasks as VideoTask[], user: data.user as User };
}

export interface AdminOverview {
  stats: {
    users: number;
    orders: number;
    paidOrders: number;
    videoTasks: number;
    generations: number;
    feedbacks: number;
    riskRecords: number;
  };
  recentUsers: User[];
  recentOrders: Order[];
  recentTasks: VideoTask[];
  recentHistories: HistoryItem[];
  recentFeedbacks: {
    id: string;
    type: string;
    contact: string;
    description: string;
    status: string;
    createdAt: string;
  }[];
  recentRisks: {
    id: string;
    contentType: string;
    riskLevel: string;
    content: string;
    createdAt: string;
  }[];
}

export async function apiAdminOverview(): Promise<{
  overview?: AdminOverview;
  error?: string;
}> {
  const res = await fetch("/api/admin/overview", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "admin_failed" };
  return { overview: data.overview as AdminOverview };
}

export async function apiAdminAdjustUser(
  userId: string,
  patch: {
    dailyQuota?: number;
    bonusQuota?: number;
    videoCoin?: number;
    plan?: User["plan"];
    reason?: string;
  }
): Promise<{ user?: User; error?: string }> {
  const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(patch),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { user: data.user as User };
}

export async function apiSubmitFeedback(input: {
  type: string;
  contact: string;
  description: string;
  orderNo?: string;
  taskId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/support/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error };
  return { ok: true };
}

export async function apiConfirmMockPay(
  orderId: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  const res = await fetch("/api/pay/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error };
  return { ok: true, user: data.user as User };
}

export async function apiCreatePayOrder(
  product: ProductDef
): Promise<{ order?: Order; payUrl?: string; mock?: boolean; error?: string }> {
  const res = await fetch("/api/pay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productName: product.productName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "pay_create_failed" };
  return { order: data.order, payUrl: data.payUrl, mock: data.mock };
}

export async function apiPayStatus(orderNo: string): Promise<{
  order?: Order;
  user?: User;
  error?: string;
}> {
  const res = await fetch(
    `/api/pay/status?orderNo=${encodeURIComponent(orderNo)}`,
    { credentials: "include" }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "status_failed" };
  return { order: data.order as Order, user: data.user as User };
}

export function isClientAlipayMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_BACKEND_MODE === "server" &&
    process.env.NEXT_PUBLIC_PAY_PROVIDER === "alipay"
  );
}

export async function apiGenerateAccount(input: Record<string, string>): Promise<{
  result?: Record<string, unknown>;
  risk?: RiskResult;
  user?: User;
  error?: string;
  generationId?: string;
}> {
  const res = await fetch("/api/v1/generate/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return {
    result: data.result,
    risk: data.risk,
    user: data.user,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiGenerateViral(title: string, copy: string) {
  const res = await fetch("/api/v1/generate/viral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title, copy }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return {
    result: data.result,
    risk: data.risk,
    user: data.user,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiGenerateDaily(topic: string) {
  const res = await fetch("/api/v1/generate/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ topic }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return {
    result: data.result,
    risk: data.risk,
    user: data.user,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiGeneratePublishPack(input: Record<string, unknown>) {
  const res = await fetch("/api/v1/generate/publish-pack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return {
    result: data.result,
    risk: data.risk,
    user: data.user,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiDrawTopicBox(input: Record<string, string>) {
  const res = await fetch("/api/v1/topic-box", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return {
    result: data.result,
    user: data.user as User | undefined,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiDrawTitleGacha(input: Record<string, string>) {
  const res = await fetch("/api/v1/title-gacha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { result: data.result };
}

export async function apiEmotionChat(input: {
  chat: string;
  relationship: string;
  goal: string;
  style: string;
}): Promise<{
  result?: Record<string, unknown>;
  usedMock?: boolean;
  user?: User;
  error?: string;
  generationId?: string;
}> {
  const res = await fetch("/api/v1/emotion-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  const payload = {
    result: data.result as Record<string, unknown> | undefined,
    usedMock: Boolean(data.usedMock),
    user: data.user as User | undefined,
    generationId: data.generationId as string | undefined,
  };
  if (data.user) return payload;
  return { result: payload.result, usedMock: payload.usedMock, generationId: payload.generationId };
}

export async function apiGetInspirationTitles(batch = 0): Promise<{
  titles?: string[];
  items?: { title: string; heat: HeatLevel }[];
  meta?: {
    date: string;
    total: number;
    updatedAt: string;
    note: string;
  };
  batch?: number;
  error?: string;
}> {
  const res = await fetch(`/api/v1/inspiration-titles?batch=${batch}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { titles: data.titles, items: data.items, meta: data.meta, batch: data.batch };
}

export async function apiGetHotTopics(batch = 0) {
  const res = await fetch(`/api/hot-topics?limit=20&page=${batch + 1}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return {
    items: data.items,
    meta: data.meta
      ? {
          date: data.meta.batchDate,
          total: data.meta.total,
          updatedAt: data.meta.updatedAt,
          sources: ["DailyHotApi", "AI"],
          note: data.meta.message ?? "",
          stale: data.meta.stale,
        }
      : undefined,
    batch,
  };
}

export async function apiGetHotTopicsTop(): Promise<{
  items?: HotTopicItem[];
  meta?: { updatedAt?: string; stale?: boolean; message?: string };
  error?: string;
}> {
  const res = await fetch("/api/hot-topics/top", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { items: data.items, meta: data.meta };
}

export async function apiGetHotTopicDetail(id: string): Promise<{
  item?: HotTopicItem;
  related?: HotTopicItem[];
  meta?: Record<string, unknown>;
  error?: string;
}> {
  const res = await fetch(`/api/hot-topics/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { item: data.item, related: data.related, meta: data.meta };
}

export interface InviteRecordDto {
  id: string;
  inviteeMobileMasked: string;
  registeredAt: string;
  rewardStatus: string;
  inviterRewardQuota: number;
  inviteeRewardQuota: number;
  memberRewardQuota: number;
  isMember: boolean;
}

export async function apiInviteRecords(): Promise<{
  records?: InviteRecordDto[];
  error?: string;
}> {
  const res = await fetch("/api/v1/invite/records", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { records: data.records as InviteRecordDto[] };
}

export async function apiInviteBlindBox(): Promise<{
  reward?: { type: string; label: string; amount?: number };
  user?: User;
  error?: string;
}> {
  const res = await fetch("/api/v1/invite/blind-box", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { reward: data.reward, user: data.user as User };
}

export async function apiProductState(): Promise<{
  dailyUsage?: {
    topicBox: number;
    titleGacha: number;
    viralScore: number;
    hotTopicGen: number;
  };
  growth?: {
    xp: number;
    streakDays: number;
    tasksDone: string[];
    lastCheckinDate: string | null;
  };
  error?: string;
}> {
  const res = await fetch("/api/v1/product-state", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { dailyUsage: data.dailyUsage, growth: data.growth };
}

export async function apiGrowthAction(input: {
  action: "checkin" | "task" | "xp";
  taskId?: string;
  xpAmount?: number;
}): Promise<{
  growth?: {
    xp: number;
    streakDays: number;
    tasksDone: string[];
    lastCheckinDate: string | null;
  };
  user?: User;
  error?: string;
}> {
  const res = await fetch("/api/v1/growth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { growth: data.growth, user: data.user as User };
}

export async function apiAccountTest(answers: Record<string, string>) {
  const res = await fetch("/api/v1/account-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ answers }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { result: data.result, user: data.user as User };
}

export async function apiReview(input: Record<string, string | number>) {
  const res = await fetch("/api/v1/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return {
    result: data.result,
    usedMock: Boolean(data.usedMock),
    user: data.user as User,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiReply(comment: string) {
  const res = await fetch("/api/v1/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ comment }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return {
    result: data.result,
    user: data.user as User,
    generationId: data.generationId as string | undefined,
  };
}

export async function apiScore(input: Record<string, string>) {
  const res = await fetch("/api/v1/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return {
    result: data.result,
    user: data.user as User,
    generationId: data.generationId as string | undefined,
  };
}
