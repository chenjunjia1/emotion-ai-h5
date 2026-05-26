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
    error === "login_mobile_not_allowed"
      ? "loginMobileNotAllowed"
      : error === "code_expired"
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
    resetUsedCount?: boolean;
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

export interface AdminUserRow extends User {
  createdAt: string;
}

export interface AdminOrderRow extends Order {
  userId: string;
  userMobile: string;
  payChannel: string;
  paidAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminMobile: string;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  createdAt: string;
}

export interface AdminContentStats {
  dateKey: string;
  hotTopicsActive: number;
  hotTopicsTotal: number;
  inspirationTitles: number;
  xhsNotes: number;
  latestPush?: {
    title: string;
    body: string;
    dateKey: string;
    createdAt: string;
  };
}

type AdminListResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  error?: string;
};

async function adminFetch<T extends Record<string, unknown>>(
  url: string,
  init?: RequestInit
): Promise<T & { error?: string }> {
  const res = await fetch(url, { credentials: "include", ...init });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) return { error: data.error || "admin_failed" } as T & { error?: string };
  return data;
}

export async function apiAdminListUsers(params: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<AdminListResult<AdminUserRow>> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 20));
  return adminFetch(`/api/admin/users?${sp}`);
}

export async function apiAdminListOrders(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminListResult<AdminOrderRow>> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 20));
  return adminFetch(`/api/admin/orders?${sp}`);
}

export async function apiAdminListFeedback(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminListResult<AdminOverview["recentFeedbacks"][number]>> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 20));
  return adminFetch(`/api/admin/feedback?${sp}`);
}

export async function apiAdminUpdateFeedback(
  id: string,
  status: "pending" | "processed"
): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { ok: true };
}

export async function apiAdminListAudit(params: {
  page?: number;
  limit?: number;
}): Promise<AdminListResult<AdminAuditLog>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 20));
  return adminFetch(`/api/admin/audit?${sp}`);
}

export async function apiAdminContentStats(): Promise<{
  stats?: AdminContentStats;
  error?: string;
}> {
  return adminFetch("/api/admin/content/stats");
}

export async function apiAdminRefreshHotTopics(): Promise<{
  ok?: boolean;
  error?: string;
  count?: number;
  source?: string;
}> {
  const res = await fetch("/api/admin/content/refresh-hot-topics", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "refresh_failed" };
  return data;
}

export interface AdminHotTopicRow {
  id: string;
  raw_title: string;
  display_title: string;
  summary: string;
  platform: string;
  heat_value: string;
  heat_score: number;
  cover_image: string;
  category: string;
  tags: string[];
  viral_score: number;
  status: "active" | "inactive" | "rejected";
  is_new: boolean;
  badge_label: string | null;
  likes_label: string | null;
  saves_label: string | null;
  comments_label: string | null;
  display_order: number;
  updated_batch_date: string;
}

export async function apiAdminListHotTopics(params: {
  batch?: string;
  status?: string;
  category?: string;
  platformFilter?: "cron" | "xhs" | "all";
  q?: string;
  page?: number;
  limit?: number;
}): Promise<
  AdminListResult<AdminHotTopicRow> & {
    batches?: string[];
    categoryStats?: { category: string; count: number }[];
    sourceCounts?: { cron: number; xhsInspiration: number; total: number };
    platformFilter?: string;
    resolvedBatch?: string;
  }
> {
  const sp = new URLSearchParams();
  if (params.batch) sp.set("batch", params.batch);
  if (params.status) sp.set("status", params.status);
  if (params.category) sp.set("category", params.category);
  if (params.platformFilter) sp.set("platformFilter", params.platformFilter);
  if (params.q) sp.set("q", params.q);
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 20));
  return adminFetch(`/api/admin/hot-topics?${sp}`);
}

export async function apiAdminPurgeCronHotTopics(opts?: {
  batchDate?: string;
  scope?: "cron" | "all";
  confirm?: boolean;
}): Promise<{
  ok?: boolean;
  deleted?: number;
  scope?: string;
  before?: { cron: number; xhsInspiration: number; total: number };
  after?: { cron: number; xhsInspiration: number; total: number };
  counts?: { cron: number; xhsInspiration: number; total: number };
  error?: string;
  message?: string;
}> {
  const res = await fetch("/api/admin/hot-topics/purge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      batchDate: opts?.batchDate,
      scope: opts?.scope ?? "cron",
      confirm: opts?.confirm ?? false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, message: data.message, counts: data.counts };
  return data;
}

export async function apiAdminCreateHotTopic(
  payload: Record<string, unknown>
): Promise<{ item?: AdminHotTopicRow; error?: string }> {
  const res = await fetch("/api/admin/hot-topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { item: data.item as AdminHotTopicRow };
}

export async function apiAdminUploadImage(
  file: File
): Promise<{ url?: string; error?: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload-image", {
    method: "POST",
    credentials: "include",
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "upload_failed" };
  return { url: (data.url as string) || (data.path as string) };
}

export async function apiAdminUpdateHotTopic(
  id: string,
  payload: Record<string, unknown>
): Promise<{ item?: AdminHotTopicRow; error?: string }> {
  const res = await fetch(`/api/admin/hot-topics/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { item: data.item as AdminHotTopicRow };
}

export async function apiAdminQueryTodayHotTopics(params: {
  date?: string;
  tab?: string;
  category?: string;
  q?: string;
}): Promise<{
  dateKey?: string;
  fetchedAt?: string;
  tab?: string;
  rawTotal?: number;
  filteredTotal?: number;
  items?: import("@/lib/admin/today-hot-query-types").AdminTodayHotQueryRow[];
  categoryStats?: { category: string; count: number }[];
  availableDates?: string[];
  error?: string;
}> {
  const sp = new URLSearchParams();
  if (params.date) sp.set("date", params.date);
  if (params.tab) sp.set("tab", params.tab);
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  return adminFetch(`/api/admin/today-hot-topics?${sp}`);
}

export async function apiAdminGetXhsNotes(date?: string): Promise<{
  dateKey?: string;
  notes?: import("@/lib/xhs/types").XhsHotNote[];
  fetchedAt?: string;
  error?: string;
}> {
  const sp = date ? `?date=${encodeURIComponent(date)}` : "";
  return adminFetch(`/api/admin/xhs-notes${sp}`);
}

export async function apiAdminSaveXhsNotes(
  notes: import("@/lib/xhs/types").XhsHotNote[],
  dateKey?: string
): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch("/api/admin/xhs-notes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ notes, dateKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error };
  return { ok: true };
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2800);
  try {
    const res = await fetch("/api/v1/generate/publish-pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error, risk: data.risk };
    return {
      result: data.result,
      risk: data.risk,
      user: data.user,
      generationId: data.generationId as string | undefined,
      fastPath: data.fastPath as boolean | undefined,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { error: "timeout" };
    }
    return { error: "network" };
  } finally {
    clearTimeout(timer);
  }
}

export async function apiQuickPublishPackage(input: Record<string, unknown>) {
  const isAdvanced = input.mode === "advanced";
  const timeoutMs = isAdvanced ? 240_000 : 45_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/v1/publish-package/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: data.error as string | undefined,
        message: data.message as string | undefined,
        risk: data.risk,
        quotaHint: data.quotaHint as string | undefined,
      };
    }
    return {
      package: data.package,
      user: data.user as User | undefined,
      generationId: data.generationId as string | undefined,
      usedMock: Boolean(data.usedMock),
      cost: data.cost as number | undefined,
      quotaReason: data.quotaReason as string | undefined,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return { error: "timeout" };
    return { error: "network" };
  } finally {
    clearTimeout(timer);
  }
}

export async function apiPublishPackageQuotaPreview(
  mode: "quick" | "advanced",
  imageCount?: 1 | 2 | 4
): Promise<{
  cost?: number;
  canProceed?: boolean;
  freeRemaining?: number;
  isPro?: boolean;
  reason?: string;
  totalQuota?: number;
  error?: string;
}> {
  const q = new URLSearchParams({ mode });
  if (mode === "advanced" && imageCount) {
    q.set("imageCount", String(imageCount));
  }
  const res = await fetch(`/api/v1/publish-package/quota-preview?${q}`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error as string | undefined };
  return data as {
    cost: number;
    canProceed: boolean;
    freeRemaining?: number;
    isPro?: boolean;
    reason?: string;
    totalQuota?: number;
  };
}

export async function apiEnhancePublishInput(input: Record<string, unknown>) {
  const res = await fetch("/api/v1/publish-package/enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error as string | undefined };
  return { enhanced: data.enhanced as string };
}

export async function apiUpgradePublishPackage(input: Record<string, unknown>) {
  const res = await fetch("/api/v1/publish-package/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error as string | undefined };
  return {
    package: data.package,
    user: data.user as User | undefined,
    cost: data.cost as number | undefined,
  };
}

export async function apiPublishPackageImages(input: Record<string, unknown>) {
  const res = await fetch("/api/v1/publish-package/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error as string | undefined };
  return { images: data.images, user: data.user as User | undefined };
}

export async function apiPublishPackageRestyle(input: Record<string, unknown>) {
  const res = await fetch("/api/v1/publish-package/restyle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error as string | undefined };
  return {
    bodies: data.bodies as import("@/lib/publish-pack/quick-package-types").PackageBody[] | undefined,
    user: data.user as User | undefined,
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
  cost?: number;
}> {
  const res = await fetch("/api/v1/emotion-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, user: data.user as User | undefined };
  return {
    result: data.result as Record<string, unknown> | undefined,
    usedMock: Boolean(data.usedMock),
    user: data.user as User | undefined,
    generationId: data.generationId as string | undefined,
    cost: typeof data.cost === "number" ? data.cost : undefined,
  };
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

export async function apiGetHotTopics(opts?: {
  batch?: number;
  platform?: string;
  category?: string;
}) {
  const batch = opts?.batch ?? 0;
  const params = new URLSearchParams({ limit: "50", page: String(batch + 1) });
  if (opts?.platform && opts.platform !== "all") params.set("platform", opts.platform);
  if (opts?.category && opts.category !== "全部") params.set("category", opts.category);

  const res = await fetch(`/api/hot-topics?${params}`, {
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
          libraryTotal: data.meta.libraryTotal ?? data.meta.total,
          todayFeatured: data.meta.todayFeatured,
          libraryLabel: data.meta.libraryLabel,
          updatedAt: data.meta.updatedAt,
          sources: data.meta?.sources ?? ["TianAPI", "DailyHotApi", "AI"],
          note: data.meta?.message ?? data.meta?.note ?? "",
          stale: data.meta.stale,
        }
      : undefined,
    batch,
  };
}

export async function apiRefreshHotTopics(force = false) {
  const qs = force ? "?force=1" : "";
  const res = await fetch(`/api/hot-topics/refresh${qs}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error ?? "refresh_failed", ...data };
  return data as { ok: boolean; refreshed?: boolean; message?: string };
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
