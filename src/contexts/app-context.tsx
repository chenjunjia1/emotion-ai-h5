"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isPilotLoginMobile } from "@/lib/auth/login-allowlist";
import { debouncedSaveJson } from "@/lib/debounce-storage";
import {
  MOCK_SMS_CODE,
  PLAN_QUOTA,
  NEW_USER_WELCOME_BONUS,
  FREE_LIBRARY_MAX,
  PRODUCTS,
  QUOTA_COST,
  STORAGE_FEEDBACKS,
  STORAGE_HISTORIES,
  STORAGE_INVITE_PENDING,
  STORAGE_LANG,
  STORAGE_LOGS,
  STORAGE_ORDERS,
  STORAGE_TASKS,
  STORAGE_USER,
  VIDEO_COIN_COST,
} from "@/lib/constants/v1";
import { makeInviteCode } from "@/lib/invite-code";
import { persistUserLocal, readUserLocal } from "@/lib/client/persist-user";
import {
  needsAiProfileOnboarding,
  redirectToOnboarding,
} from "@/lib/onboarding/redirect";
import {
  grantLocalMemberInviteReward,
  mergeInviteRegistryUser,
  processLocalInviteOnRegister,
  saveInviteRegistryUser,
} from "@/lib/v1/invite-local";
import { trackEvent } from "@/lib/analytics";
import { t, type I18nKey } from "@/lib/i18n";
import {
  applyQuotaDeduct,
  canAffordQuota,
  getQuotaCost,
} from "@/lib/v1/quota";
import {
  apiConfirmMockPay,
  apiCreatePayOrder,
  apiCreateVideoTask,
  apiGenerateAccount,
  apiGenerateDaily,
  apiGeneratePublishPack,
  apiGenerateViral,
  apiLogin,
  apiLogout,
  apiMeSync,
  apiPollVideoTasks,
  apiSendCode,
  apiSubmitFeedback,
  isClientServerMode,
  loginErrorMessage,
} from "@/lib/client/server-api";
import { canCreateVideo, canGenerate, checkContentRisk } from "@/lib/risk";
import { mergeHistories } from "@/lib/history/merge-histories";
import type {
  FlowLog,
  HistoryItem,
  Lang,
  Order,
  ProductDef,
  RiskResult,
  User,
  VideoTask,
} from "@/lib/types/v1";
import { AppUiProvider } from "@/contexts/app-ui-context";

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: I18nKey) => string;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  histories: HistoryItem[];
  orders: Order[];
  tasks: VideoTask[];
  flowLogs: FlowLog[];
  toast: string;
  showToast: (msg: string) => void;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  quotaModalOpen: boolean;
  setQuotaModalOpen: (v: boolean) => void;
  quotaModalDetail: { need: number; have: number } | null;
  openQuotaModal: (detail?: { need: number; have: number }) => void;
  payOrder: Order | null;
  setPayOrder: (o: Order | null) => void;
  videoDraft: { script?: string; hook?: string } | null;
  setVideoDraft: (d: { script?: string; hook?: string } | null) => void;
  sendCode: (mobile: string) => Promise<boolean>;
  login: (
    mobile: string,
    code: string
  ) => Promise<{ ok: boolean; message?: string; needsOnboarding?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  scheduleBackgroundSync: () => void;
  addHistory: (
    type: string,
    topic: string,
    output?: Record<string, unknown>,
    opts?: { id?: string }
  ) => void;
  addRiskRecord: (contentType: string, content: string, risk: RiskResult) => void;
  generateAccount: (
    input: Record<string, string>
  ) => Promise<{ result?: unknown; risk: RiskResult }>;
  generateDaily: (topic: string) => Promise<{ result?: unknown; risk: RiskResult }>;
  generatePublishPack: (input: {
    topic: string;
    platform: string;
    track: string;
    goal: string;
    style: string;
    withXhs?: boolean;
    quotaAction?: keyof typeof QUOTA_COST;
    extraNote?: string;
    accountType?: string;
    topicId?: string;
    hotTopicSummary?: string;
    hotTopicAngles?: string[];
    hotTopicTargetUsers?: string[];
    inspirationRewriteOnly?: boolean;
    momentsContentTypes?: string[];
    momentsDirections?: string[];
  }) => Promise<{ result?: Record<string, unknown>; risk: RiskResult }>;
  generateViral: (
    title: string,
    copy: string
  ) => Promise<{ result?: unknown; risk: RiskResult }>;
  createOrder: (product: ProductDef) => Order | null;
  paySuccess: (order: Order) => void;
  payFail: (order: Order) => void;
  payClose: (order: Order) => void;
  submitFeedback: (input: {
    type: string;
    contact: string;
    description: string;
    orderNo?: string;
    taskId?: string;
  }) => void | Promise<void>;
  createVideoTask: (input: {
    taskType: "avatar" | "auto";
    script: string;
    duration: 30 | 60;
  }) => boolean;
  products: ProductDef[];
}

const AppContext = createContext<AppContextValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  debouncedSaveJson(key, value);
}

const smsState: Record<string, { lastSent: number; dayCount: number; failCount: number }> = {};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");
  const [user, setUser] = useState<User | null>(null);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [flowLogs, setFlowLogs] = useState<FlowLog[]>([]);
  const [toast, setToast] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [quotaModalDetail, setQuotaModalDetail] = useState<{
    need: number;
    have: number;
  } | null>(null);
  const [payOrder, setPayOrder] = useState<Order | null>(null);
  const openQuotaModal = useCallback((detail?: { need: number; have: number }) => {
    setQuotaModalDetail(detail ?? null);
    setQuotaModalOpen(true);
  }, []);
  const [videoDraft, setVideoDraft] = useState<{ script?: string; hook?: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncFromServer = useCallback(async () => {
    const data = await apiMeSync();
    if (data.unauthorized) {
      setUser(null);
      localStorage.removeItem(STORAGE_USER);
      return;
    }
    if (data.user) {
      persistUserLocal(data.user);
      setUser(data.user);
    }
    if (data.orders) setOrders(data.orders);
    if (data.tasks) setTasks(data.tasks);
    if (data.histories) {
      setHistories((prev) => mergeHistories(data.histories!, prev));
    }
  }, []);

  const scheduleBackgroundSync = useCallback(() => {
    if (!isClientServerMode()) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void syncFromServer();
    }, 600);
  }, [syncFromServer]);

  useLayoutEffect(() => {
    setLangState(loadJson(STORAGE_LANG, "zh"));
    const cachedUser = readUserLocal();
    if (cachedUser) {
      setUser(cachedUser);
    }
    if (!isClientServerMode()) {
      setHistories(loadJson(STORAGE_HISTORIES, []));
      setOrders(loadJson(STORAGE_ORDERS, []));
      setTasks(loadJson(STORAGE_TASKS, []));
      setFlowLogs(loadJson(STORAGE_LOGS, []));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (isClientServerMode()) {
      void syncFromServer();
    }
  }, [syncFromServer]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_LANG, lang);
  }, [lang, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      persistUserLocal(user);
      saveJson(STORAGE_USER, user);
      if (!isClientServerMode()) saveInviteRegistryUser(user);
    } else if (!isClientServerMode()) {
      localStorage.removeItem(STORAGE_USER);
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated || histories.length === 0) return;
    saveJson(STORAGE_HISTORIES, histories);
  }, [histories, hydrated]);

  useEffect(() => {
    if (!hydrated || isClientServerMode()) return;
    saveJson(STORAGE_ORDERS, orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated || isClientServerMode()) return;
    saveJson(STORAGE_TASKS, tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_LOGS, flowLogs);
  }, [flowLogs, hydrated]);

  const appendLog = useCallback((type: FlowLog["type"], message: string) => {
    setFlowLogs((list) =>
      [
        {
          id: String(Date.now()) + Math.random(),
          type,
          message,
          createdAt: new Date().toLocaleString(),
        },
        ...list,
      ].slice(0, 100)
    );
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const tr = useCallback((key: I18nKey) => t(lang, key), [lang]);

  /* V1 不做成片，关闭视频任务轮询，减少后台请求与重渲染 */

  const addHistory = useCallback(
    (
      type: string,
      topic: string,
      output?: Record<string, unknown>,
      opts?: { id?: string }
    ) => {
      setHistories((list) => {
        const next = [
          {
            id: opts?.id ?? String(Date.now()),
            type,
            topic,
            createdAt: new Date().toLocaleString(),
            output,
          },
          ...list,
        ];
        const u = readUserLocal();
        if (u?.plan === "free" && next.length > FREE_LIBRARY_MAX) {
          return next.slice(0, FREE_LIBRARY_MAX);
        }
        return next.slice(0, 50);
      });
    },
    []
  );

  const sendCode = useCallback(
    async (mobile: string) => {
      const m = mobile.trim();
      if (!isPilotLoginMobile(m)) {
        showToast(tr("loginMobileNotAllowed"));
        return false;
      }
      if (isClientServerMode()) {
        const r = await apiSendCode(m);
        if (r.ok) {
          appendLog("sms_logs", `向 ${m} 发送验证码`);
          if (r.devCode) {
            showToast(`${tr("codeSentDevLocal")} ${r.devCode}`);
          } else {
            showToast(r.dev ? tr("codeSentDev") : tr("codeSentSms"));
          }
          return true;
        }
        if (r.error === "login_mobile_not_allowed") {
          showToast(tr("loginMobileNotAllowed"));
          return false;
        }
        showToast(tr("smsFrequent"));
        return false;
      }
      const now = Date.now();
      const s = smsState[mobile] ?? { lastSent: 0, dayCount: 0, failCount: 0 };
      if (now - s.lastSent < 60000) {
        showToast(tr("smsFrequent"));
        return false;
      }
      if (s.dayCount >= 5) {
        showToast(tr("smsFrequent"));
        return false;
      }
      smsState[mobile] = { ...s, lastSent: now, dayCount: s.dayCount + 1 };
      appendLog("sms_logs", `向 ${mobile} 发送验证码（Mock）`);
      showToast(tr("codeSent"));
      return true;
    },
    [appendLog, showToast, tr]
  );

  const login = useCallback(
    async (mobile: string, code: string) => {
      const m = mobile.trim();
      const c = code.trim();
      if (!c) {
        const msg = tr("codeEmpty");
        showToast(msg);
        return { ok: false, message: msg };
      }
      if (!isPilotLoginMobile(m)) {
        const msg = tr("loginMobileNotAllowed");
        showToast(msg);
        return { ok: false, message: msg };
      }

      if (isClientServerMode()) {
        const pendingInvite = localStorage.getItem(STORAGE_INVITE_PENDING) || "";
        const r = await apiLogin(m, c, pendingInvite || undefined);
        if (r.ok) localStorage.removeItem(STORAGE_INVITE_PENDING);
        if (r.ok && r.user) {
          const needsOnboarding = needsAiProfileOnboarding(r.user.id);
          persistUserLocal(r.user);
          setUser(r.user);
          scheduleBackgroundSync();
          if (needsOnboarding) {
            setLoginOpen(false);
            redirectToOnboarding();
            return { ok: true, needsOnboarding: true };
          }
          setLoginOpen(false);
          trackEvent("login_success", { mode: "server" });
          showToast(tr("loginSuccess"));
          return { ok: true, needsOnboarding: false };
        }
        const msg = loginErrorMessage(r.error, lang);
        showToast(msg);
        return { ok: false, message: msg };
      }

      const sms = smsState[m] ?? { lastSent: 0, dayCount: 0, failCount: 0 };
      if (sms.failCount >= 5) {
        const msg = tr("smsFrequent");
        showToast(msg);
        appendLog("sms_logs", `${m} 验证码错误次数过多，已锁定`);
        return { ok: false, message: msg };
      }
      if (c !== MOCK_SMS_CODE) {
        smsState[m] = { ...sms, failCount: sms.failCount + 1 };
        const msg = tr("codeError");
        showToast(msg);
        appendLog("sms_logs", `${m} 验证码错误 ${sms.failCount + 1}/5`);
        return { ok: false, message: msg };
      }
      smsState[m] = { ...sms, failCount: 0 };
      const cached = readUserLocal();
      const existing =
        user?.mobile === m ? user : cached?.mobile === m ? cached : null;
      const isNew = !existing;
      const uid = existing?.id ?? `u-${m}`;
      let nextUser: User =
        existing ??
        ({
          id: uid,
          mobile: m,
          role: m.endsWith("0000") ? "admin" : "user",
          plan: "free",
          dailyQuota: PLAN_QUOTA.free,
          usedCount: 0,
          bonusQuota: NEW_USER_WELCOME_BONUS,
          videoCoin: 0,
          frozenVideoCoin: 0,
          language: lang,
          inviteCode: makeInviteCode(m, uid),
          inviteCount: 0,
          growthXp: 0,
          streakDays: 0,
        } as User);
      nextUser = mergeInviteRegistryUser(nextUser);

      const pendingInvite = localStorage.getItem(STORAGE_INVITE_PENDING) || "";
      if (isNew && pendingInvite) {
        const ir = processLocalInviteOnRegister({
          invitee: nextUser,
          inviteCode: pendingInvite,
        });
        localStorage.removeItem(STORAGE_INVITE_PENDING);
        if (ir.ok && ir.invitee) {
          nextUser = ir.invitee;
          showToast(tr("inviteSuccess"));
        } else if (ir.reason && ir.reason !== "no_code") {
          showToast(tr("inviteInvalid"));
        }
      } else if (pendingInvite) {
        localStorage.removeItem(STORAGE_INVITE_PENDING);
      }

      saveInviteRegistryUser(nextUser);
      const needsOnboarding = needsAiProfileOnboarding(nextUser.id);
      persistUserLocal(nextUser);
      setUser(nextUser);
      if (needsOnboarding) {
        setLoginOpen(false);
        redirectToOnboarding();
        return { ok: true, needsOnboarding: true };
      }
      setLoginOpen(false);
      trackEvent("login_success", { mode: "local" });
      showToast(tr("loginSuccess"));
      return { ok: true, needsOnboarding: false };
    },
    [appendLog, lang, scheduleBackgroundSync, showToast, tr, user]
  );

  const refreshUser = useCallback(async () => {
    if (!isClientServerMode()) return;
    await syncFromServer();
  }, [syncFromServer]);

  const logout = useCallback(() => {
    if (isClientServerMode()) void apiLogout();
    setUser(null);
    localStorage.removeItem(STORAGE_USER);
  }, []);

  const checkQuota = useCallback(
    (type: keyof typeof QUOTA_COST): boolean => {
      if (!user) {
        setLoginOpen(true);
        showToast(tr("pleaseLogin"));
        return false;
      }
      if (canAffordQuota(user, type)) return true;
      const cost = getQuotaCost(type);
      const total = user.dailyQuota - user.usedCount + user.bonusQuota;
      const have = Math.max(0, total);
      showToast(
        tr("quotaNeedMore").replace("{need}", String(cost)).replace("{have}", String(have))
      );
      openQuotaModal({ need: cost, have });
      return false;
    },
    [openQuotaModal, showToast, tr, user]
  );

  const deductQuota = useCallback(
    (type: keyof typeof QUOTA_COST, reason: string) => {
      const cost = getQuotaCost(type);
      setUser((u) => {
        if (!u) return u;
        const next = applyQuotaDeduct(u, cost);
        if (!next) return u;
        appendLog("quota_logs", `${reason} 扣除额度 ${cost} 次`);
        return next;
      });
    },
    [appendLog]
  );

  const addRiskRecord = useCallback(
    (contentType: string, content: string, risk: RiskResult) => {
      appendLog(
        "risk_records",
        `${contentType} · ${risk.level}风险 · 词：${risk.words.join("、") || "无"}`
      );
    },
    [appendLog]
  );

  const generateAccount = useCallback(
    async (input: Record<string, string>) => {
      const text = Object.values(input).join("");
      const risk = checkContentRisk(text);
      addRiskRecord("账号方案", text, risk);
      if (!canGenerate(risk.level)) {
        showToast(tr("riskHigh"));
        return { risk };
      }
      if (risk.level === "中") showToast(tr("riskMid"));
      if (!checkQuota("account")) return { risk };

      if (isClientServerMode()) {
        const res = await apiGenerateAccount(input);
        if (res.error) {
          if (res.error === "quota_insufficient") showToast(tr("quotaInsufficient"));
          else if (res.error === "unauthorized") setLoginOpen(true);
          return { risk: res.risk ?? risk };
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          addHistory(
            "账号方案",
            `${input.platform}-${input.track}`,
            res.result as Record<string, unknown>,
            { id: res.generationId }
          );
          scheduleBackgroundSync();
        }
        return { result: res.result, risk: res.risk ?? risk };
      }

      const { mockAccountPackage } = await import("@/lib/mock/v1-generators");
      const result = mockAccountPackage({
        platform: input.platform ?? "抖音",
        track: input.track ?? "婚恋情感",
        goal: input.goal ?? "涨粉",
        style: input.style ?? "温柔走心",
      });
      deductQuota("account", "账号方案");
      addHistory("账号方案", `${input.platform}-${input.track}`, result as Record<string, unknown>);
      return { result, risk };
    },
    [addHistory, addRiskRecord, checkQuota, deductQuota, scheduleBackgroundSync, showToast, tr]
  );

  const generateDaily = useCallback(
    async (topic: string) => {
      const risk = checkContentRisk(topic);
      addRiskRecord("今日视频", topic, risk);
      if (!canGenerate(risk.level)) {
        showToast(tr("riskHigh"));
        return { risk };
      }
      if (risk.level === "中") showToast(tr("riskMid"));
      if (!checkQuota("publish_pack")) return { risk };

      if (isClientServerMode()) {
        const res = await apiGenerateDaily(topic);
        if (res.error) {
          if (res.error === "quota_insufficient") showToast(tr("quotaInsufficient"));
          else if (res.error === "unauthorized") setLoginOpen(true);
          return { risk: res.risk ?? risk };
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          addHistory("完整发布包", topic, res.result as Record<string, unknown>, {
            id: res.generationId,
          });
          scheduleBackgroundSync();
        }
        return { result: res.result, risk: res.risk ?? risk };
      }

      const { mockDailyVideo } = await import("@/lib/mock/v1-generators");
      const result = mockDailyVideo(topic);
      deductQuota("publish_pack", "完整发布包");
      addHistory("完整发布包", topic, result as Record<string, unknown>);
      return { result, risk };
    },
    [addHistory, addRiskRecord, checkQuota, deductQuota, scheduleBackgroundSync, showToast, tr]
  );

  const generatePublishPack = useCallback(
    async (input: {
      topic: string;
      platform: string;
      track: string;
      goal: string;
      style: string;
      withXhs?: boolean;
      quotaAction?: keyof typeof QUOTA_COST;
      extraNote?: string;
      accountType?: string;
      topicId?: string;
      hotTopicSummary?: string;
      hotTopicAngles?: string[];
      hotTopicTargetUsers?: string[];
      momentsContentTypes?: string[];
      momentsDirections?: string[];
      inspirationRewriteOnly?: boolean;
    }) => {
      const topic = input.topic.trim();
      const quotaAction = input.quotaAction ?? "publish_pack";
      const historyLabel =
        quotaAction === "hot_topic_pack"
          ? "爆品内容包"
          : input.platform === "朋友圈"
            ? "朋友圈文案"
            : "完整发布包";
      const risk = checkContentRisk(topic);
      addRiskRecord(historyLabel, topic, risk);
      if (!canGenerate(risk.level)) {
        showToast(tr("riskHigh"));
        return { risk };
      }
      if (risk.level === "中") showToast(tr("riskMid"));
      if (!checkQuota(quotaAction)) return { risk };

      if (isClientServerMode()) {
        const res = await apiGeneratePublishPack({
          topic,
          platform: input.platform,
          track: input.track,
          goal: input.goal,
          style: input.style,
          withXhs: input.withXhs,
          quotaAction,
          extraNote: input.extraNote,
          accountType: input.accountType,
          topicId: input.topicId,
          hotTopicSummary: input.hotTopicSummary,
          hotTopicAngles: input.hotTopicAngles,
          hotTopicTargetUsers: input.hotTopicTargetUsers,
          momentsContentTypes: input.momentsContentTypes,
          momentsDirections: input.momentsDirections,
          inspirationRewriteOnly: input.inspirationRewriteOnly,
        });
        if (res.error) {
          if (res.error === "quota_insufficient") openQuotaModal();
          else if (res.error === "unauthorized") setLoginOpen(true);
          return { error: res.error, risk: res.risk ?? risk };
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          addHistory(historyLabel, topic, res.result as Record<string, unknown>, {
            id: res.generationId,
          });
          scheduleBackgroundSync();
          return { result: res.result, risk: res.risk ?? risk };
        }
        return { risk: res.risk ?? risk };
      }

      const pack =
        input.platform === "朋友圈"
          ? (
              await import("@/lib/publish-pack/moments-result")
            ).mockMomentsPack({
              topic,
              contentTypes: input.momentsContentTypes,
              directions: input.momentsDirections,
              extraNote: input.extraNote,
            })
          : (
              await import("@/lib/mock/content-v1")
            ).mockPublishPack({
              topic,
              platform: input.platform,
              track: input.track,
              goal: input.goal,
              style: input.style,
              withXhs: input.withXhs,
            });
      deductQuota(quotaAction, historyLabel);
      addHistory(historyLabel, topic, pack as Record<string, unknown>);
      return { result: pack as Record<string, unknown>, risk };
    },
    [
      addHistory,
      addRiskRecord,
      checkQuota,
      deductQuota,
      openQuotaModal,
      scheduleBackgroundSync,
      showToast,
      tr,
    ]
  );

  const generateViral = useCallback(
    async (title: string, copy: string) => {
      const text = title + copy;
      const risk = checkContentRisk(text);
      addRiskRecord("爆款同款", text, risk);
      if (!canGenerate(risk.level)) {
        showToast(tr("riskHigh"));
        return { risk };
      }
      if (risk.level === "中") showToast(tr("riskMid"));
      if (!checkQuota("viral")) return { risk };

      if (isClientServerMode()) {
        const res = await apiGenerateViral(title, copy);
        if (res.error) {
          if (res.error === "quota_insufficient") showToast(tr("quotaInsufficient"));
          else if (res.error === "unauthorized") setLoginOpen(true);
          return { risk: res.risk ?? risk };
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          addHistory("爆款同款", title, res.result as Record<string, unknown>, {
            id: res.generationId,
          });
          scheduleBackgroundSync();
        }
        return { result: res.result, risk: res.risk ?? risk };
      }

      const { mockViralCopy } = await import("@/lib/mock/v1-generators");
      const result = mockViralCopy(title, copy);
      deductQuota("viral", "爆款同款");
      addHistory("爆款同款", title, result as Record<string, unknown>);
      return { result, risk };
    },
    [addHistory, addRiskRecord, checkQuota, deductQuota, scheduleBackgroundSync, showToast, tr]
  );

  const grantBenefit = useCallback((order: Order, u: User): User => {
    const product = PRODUCTS.find((p) => p.productName === order.productName);
    if (!product) return u;
    if (product.productType === "video_coin" && product.coin) {
      return { ...u, videoCoin: u.videoCoin + product.coin };
    }
    if (product.productType === "quota_pack" && product.bonusQuota) {
      return { ...u, bonusQuota: u.bonusQuota + product.bonusQuota };
    }
    if (product.plan) {
      return {
        ...u,
        plan: product.plan,
        dailyQuota: product.quota ?? u.dailyQuota,
        videoCoin: u.videoCoin + (product.coin ?? 0),
      };
    }
    return u;
  }, []);

  const createOrder = useCallback(
    (product: ProductDef) => {
      if (!user) {
        setLoginOpen(true);
        return null;
      }
      trackEvent("click_pay", { product: product.productName, amount: product.amount });
      if (isClientServerMode()) {
        void (async () => {
          const r = await apiCreatePayOrder(product);
          if (r.error) {
            if (r.error === "alipay_not_configured") {
              showToast(tr("alipayNotConfigured"));
            } else {
              showToast(tr("payFail"));
            }
            return;
          }
          if (r.payUrl) {
            showToast(tr("alipayRedirecting"));
            window.location.href = r.payUrl;
            return;
          }
          if (r.order) {
            setOrders((list) => [r.order!, ...list]);
            appendLog("order_logs", `创建订单 ${r.order.orderNo} · pending`);
            setPayOrder(r.order);
          }
        })();
        return null;
      }
      const order: Order = {
        id: String(Date.now()),
        orderNo: `MOCK${Date.now()}`,
        productType: product.productType,
        productName: product.productName,
        amount: product.amount,
        status: "pending",
        benefitGranted: false,
        meta: {
          plan: product.plan,
          quota: product.quota,
          coin: product.coin,
          bonusQuota: product.bonusQuota,
          membershipDays: product.membershipDays,
        },
        createdAt: new Date().toLocaleString(),
      };
      setOrders((list) => [order, ...list]);
      appendLog("order_logs", `创建订单 ${order.orderNo} · pending`);
      setPayOrder(order);
      return order;
    },
    [appendLog, showToast, tr, user]
  );

  const paySuccess = useCallback(
    (order: Order) => {
      if (isClientServerMode()) {
        void (async () => {
          const r = await apiConfirmMockPay(order.id);
          if (r.ok && r.user) {
            setUser(r.user);
            scheduleBackgroundSync();
            setPayOrder(null);
            showToast(tr("paySuccessGranted"));
          } else {
            showToast(tr("orderProcessed"));
            setPayOrder(null);
          }
        })();
        return;
      }
      let didGrant = false;
      setOrders((list) => {
        const current = list.find((o) => o.id === order.id);
        if (
          !current ||
          current.benefitGranted ||
          current.status === "paid" ||
          current.status === "closed" ||
          current.status === "failed"
        ) {
          return list;
        }
        didGrant = true;
        return list.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: "paid" as const,
                benefitGranted: true,
                benefitGrantedAt: new Date().toISOString(),
              }
            : o
        );
      });
      if (!didGrant) {
        showToast(tr("orderProcessed"));
        appendLog("order_logs", `订单 ${order.orderNo} 已发放，拦截重复`);
        setPayOrder(null);
        return;
      }
      setUser((u) => {
        if (!u) return u;
        const wasFree = u.plan === "free";
        const next = grantBenefit(order, u);
        if (wasFree && next.plan !== "free") {
          grantLocalMemberInviteReward(next);
        }
        return next;
      });
      appendLog("order_logs", `订单 ${order.orderNo} paid · benefit_granted=true`);
      setPayOrder(null);
      showToast(tr("paySuccessGranted"));
    },
    [appendLog, grantBenefit, scheduleBackgroundSync, showToast, tr]
  );

  const payFail = useCallback(
    (order: Order) => {
      setOrders((list) =>
        list.map((o) =>
          o.id === order.id && o.status === "pending" && !o.benefitGranted
            ? { ...o, status: "failed" as const }
            : o
        )
      );
      appendLog("order_logs", `订单 ${order.orderNo} failed · 未发放权益`);
      setPayOrder(null);
      showToast(tr("payFailNoGrant"));
    },
    [appendLog, showToast, tr]
  );

  const payClose = useCallback(
    (order: Order) => {
      setOrders((list) =>
        list.map((o) =>
          o.id === order.id && o.status === "pending" && !o.benefitGranted
            ? { ...o, status: "closed" as const }
            : o
        )
      );
      appendLog("order_logs", `订单 ${order.orderNo} closed · 用户取消`);
      setPayOrder(null);
      showToast(tr("payCancelled"));
    },
    [appendLog, showToast, tr]
  );

  const submitFeedback = useCallback(
    async (input: {
      type: string;
      contact: string;
      description: string;
      orderNo?: string;
      taskId?: string;
    }) => {
      if (isClientServerMode()) {
        const r = await apiSubmitFeedback(input);
        if (!r.ok) {
          showToast(tr("payFail"));
          return;
        }
        appendLog("support_feedbacks", `反馈提交：${input.type}`);
        showToast(tr("feedbackReceived"));
        return;
      }
      const item = {
        id: String(Date.now()),
        userId: user?.id,
        type: input.type,
        contact: input.contact,
        description: input.description,
        relatedOrderNo: input.orderNo,
        relatedTaskId: input.taskId,
        status: "pending" as const,
        createdAt: new Date().toLocaleString(),
      };
      const list = loadJson(STORAGE_FEEDBACKS, [] as typeof item[]);
      saveJson(STORAGE_FEEDBACKS, [item, ...list].slice(0, 50));
      appendLog("support_feedbacks", `反馈提交：${input.type}`);
      showToast(tr("feedbackReceived"));
    },
    [appendLog, showToast, tr, user?.id]
  );

  const createVideoTask = useCallback(
    (input: { taskType: "avatar" | "auto"; script: string; duration: 30 | 60 }) => {
      if (!user) {
        setLoginOpen(true);
        return false;
      }
      const risk = checkContentRisk(input.script);
      addRiskRecord("成片任务", input.script, risk);
      if (!canCreateVideo(risk.level)) {
        showToast(tr("videoRiskBlock"));
        return false;
      }

      if (isClientServerMode()) {
        void (async () => {
          const res = await apiCreateVideoTask(input);
          if (res.error) {
            if (res.error === "coin_insufficient") {
              showToast(tr("coinInsufficient"));
              window.location.href = "/profile?pricing=1";
            } else if (res.error === "task_max_concurrent") {
              showToast(tr("taskMaxConcurrent"));
            } else if (res.error === "risk_blocked") {
              showToast(tr("riskHigh"));
            } else if (res.error === "unauthorized") {
              setLoginOpen(true);
            } else {
              showToast(tr("payFail"));
            }
            return;
          }
          if (res.user) setUser(res.user);
          if (res.task) {
            setTasks((list) => [res.task!, ...list]);
            appendLog(
              "video_coin_logs",
              `freeze · 任务 ${res.task!.id} · ${res.task!.costVideoCoin} 视频币`
            );
            showToast(tr("taskCreatedFrozen"));
          }
        })();
        return true;
      }

      const costKey =
        input.taskType === "avatar"
          ? input.duration === 60
            ? "avatar60"
            : "avatar30"
          : input.duration === 60
            ? "auto60"
            : "auto30";
      const cost = VIDEO_COIN_COST[costKey];
      const processing = tasks.filter((t) =>
        ["pending", "processing"].includes(t.status)
      ).length;
      if (processing >= 3) {
        showToast(tr("taskMaxConcurrent"));
        return false;
      }
      if (user.videoCoin < cost) {
        showToast(tr("coinInsufficient"));
        if (typeof window !== "undefined") {
          window.location.href = "/profile?pricing=1";
        }
        return false;
      }
      const id = String(Date.now());
      setUser((u) =>
        u
          ? {
              ...u,
              videoCoin: u.videoCoin - cost,
              frozenVideoCoin: u.frozenVideoCoin + cost,
            }
          : u
      );
      setTasks((list) => [
        {
          id,
          taskType: input.taskType,
          script: input.script,
          status: "processing",
          costVideoCoin: cost,
          createdAt: new Date().toLocaleString(),
        },
        ...list,
      ]);
      appendLog("video_coin_logs", `freeze · 任务 ${id} · ${cost} 视频币`);
      showToast(tr("taskCreatedFrozen"));
      const fail = input.script.includes("失败");
      setTimeout(() => {
        if (fail) {
          setTasks((list) =>
            list.map((t) =>
              t.id === id
                ? { ...t, status: "failed", errorMessage: "模拟失败" }
                : t
            )
          );
          setUser((u) =>
            u
              ? {
                  ...u,
                  videoCoin: u.videoCoin + cost,
                  frozenVideoCoin: u.frozenVideoCoin - cost,
                }
              : u
          );
          appendLog("video_coin_logs", `refund · 任务 ${id} · 退回 ${cost} 视频币`);
          showToast(tr("taskFailedRefund"));
        } else {
          setTasks((list) =>
            list.map((t) =>
              t.id === id
                ? { ...t, status: "success", videoUrl: "mock.mp4" }
                : t
            )
          );
          setUser((u) =>
            u ? { ...u, frozenVideoCoin: u.frozenVideoCoin - cost } : u
          );
          appendLog("video_coin_logs", `consume · 任务 ${id} · 消耗 ${cost} 视频币`);
          addHistory(
            "成片任务",
            input.taskType === "avatar" ? "数字人口播" : "AI自动成片",
            { script: input.script.slice(0, 40) }
          );
          showToast(tr("taskCompleted"));
        }
      }, 1800);
      return true;
    },
    [addHistory, addRiskRecord, appendLog, showToast, tasks, tr, user]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      tr,
      user,
      setUser,
      histories,
      orders,
      tasks,
      flowLogs,
      toast,
      showToast,
      loginOpen,
      setLoginOpen,
      quotaModalOpen,
      setQuotaModalOpen,
      quotaModalDetail,
      openQuotaModal,
      payOrder,
      setPayOrder,
      videoDraft,
      setVideoDraft,
      sendCode,
      login,
      logout,
      refreshUser,
      scheduleBackgroundSync,
      addHistory,
      addRiskRecord,
      generateAccount,
      generateDaily,
      generatePublishPack,
      generateViral,
      createOrder,
      paySuccess,
      payFail,
      payClose,
      submitFeedback,
      createVideoTask,
      products: PRODUCTS,
    }),
    [
      lang,
      setLang,
      tr,
      user,
      setUser,
      histories,
      orders,
      tasks,
      flowLogs,
      toast,
      showToast,
      loginOpen,
      quotaModalOpen,
      quotaModalDetail,
      openQuotaModal,
      payOrder,
      videoDraft,
      sendCode,
      login,
      logout,
      refreshUser,
      scheduleBackgroundSync,
      addHistory,
      addRiskRecord,
      generateAccount,
      generateDaily,
      generatePublishPack,
      generateViral,
      createOrder,
      paySuccess,
      payFail,
      payClose,
      submitFeedback,
      createVideoTask,
    ]
  );

  const uiValue = useMemo(
    () => ({
      lang,
      tr,
      user,
      setLoginOpen,
      openQuotaModal,
      showToast,
      pendingOrderCount: orders.filter((o) => o.status === "pending").length,
    }),
    [lang, tr, user, openQuotaModal, showToast, orders]
  );

  return (
    <AppUiProvider value={uiValue}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </AppUiProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
