"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_SMS_CODE,
  PLAN_QUOTA,
  PRODUCTS,
  QUOTA_COST,
  STORAGE_FEEDBACKS,
  STORAGE_HISTORIES,
  STORAGE_LANG,
  STORAGE_LOGS,
  STORAGE_ORDERS,
  STORAGE_TASKS,
  STORAGE_USER,
  VIDEO_COIN_COST,
} from "@/lib/constants/v1";
import { t, type I18nKey } from "@/lib/i18n";
import {
  mockAccountPackage,
  mockDailyVideo,
  mockViralCopy,
} from "@/lib/mock/v1-generators";
import {
  apiConfirmMockPay,
  apiCreatePayOrder,
  apiGenerateAccount,
  apiGenerateDaily,
  apiGenerateViral,
  apiLogin,
  apiLogout,
  apiMe,
  apiSendCode,
  isClientServerMode,
} from "@/lib/client/server-api";
import { canCreateVideo, canGenerate, checkContentRisk } from "@/lib/risk";
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

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: I18nKey) => string;
  user: User | null;
  histories: HistoryItem[];
  orders: Order[];
  tasks: VideoTask[];
  flowLogs: FlowLog[];
  toast: string;
  showToast: (msg: string) => void;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  payOrder: Order | null;
  setPayOrder: (o: Order | null) => void;
  videoDraft: { script?: string; hook?: string } | null;
  setVideoDraft: (d: { script?: string; hook?: string } | null) => void;
  sendCode: (mobile: string) => Promise<boolean>;
  login: (mobile: string, code: string) => boolean;
  logout: () => void;
  addRiskRecord: (contentType: string, content: string, risk: RiskResult) => void;
  generateAccount: (
    input: Record<string, string>
  ) => Promise<{ result?: unknown; risk: RiskResult }>;
  generateDaily: (topic: string) => Promise<{ result?: unknown; risk: RiskResult }>;
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
  }) => void;
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
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
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
  const [payOrder, setPayOrder] = useState<Order | null>(null);
  const [videoDraft, setVideoDraft] = useState<{ script?: string; hook?: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        setLangState(loadJson(STORAGE_LANG, "zh"));
        if (isClientServerMode()) {
          const remoteUser = await apiMe();
          setUser(remoteUser);
        } else {
          setUser(loadJson(STORAGE_USER, null));
        }
        setHistories(loadJson(STORAGE_HISTORIES, []));
        setOrders(loadJson(STORAGE_ORDERS, []));
        setTasks(loadJson(STORAGE_TASKS, []));
        setFlowLogs(loadJson(STORAGE_LOGS, []));
      } finally {
        setHydrated(true);
      }
    };
    void boot();
  }, []);

  // 部分内置浏览器 useEffect 异常时，避免永远卡在「加载中」
  useEffect(() => {
    const timer = window.setTimeout(() => setHydrated(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_LANG, lang);
  }, [lang, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) saveJson(STORAGE_USER, user);
    else localStorage.removeItem(STORAGE_USER);
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_HISTORIES, histories);
  }, [histories, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_ORDERS, orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
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

  const addHistory = useCallback((type: string, topic: string, output?: Record<string, unknown>) => {
    setHistories((list) =>
      [
        {
          id: String(Date.now()),
          type,
          topic,
          createdAt: new Date().toLocaleString(),
          output,
        },
        ...list,
      ].slice(0, 50)
    );
  }, []);

  const sendCode = useCallback(
    async (mobile: string) => {
      if (isClientServerMode()) {
        const r = await apiSendCode(mobile);
        if (r.ok) {
          appendLog("sms_logs", `向 ${mobile} 发送验证码`);
          showToast(tr("codeSent"));
          return true;
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
    (mobile: string, code: string) => {
      if (isClientServerMode()) {
        void (async () => {
          const r = await apiLogin(mobile, code);
          if (r.ok && r.user) {
            setUser(r.user);
            setLoginOpen(false);
            showToast(tr("loginSuccess"));
          } else {
            showToast(tr("codeError"));
          }
        })();
        return true;
      }
      const sms = smsState[mobile] ?? { lastSent: 0, dayCount: 0, failCount: 0 };
      if (sms.failCount >= 5) {
        showToast(tr("smsFrequent"));
        appendLog("sms_logs", `${mobile} 验证码错误次数过多，已锁定`);
        return false;
      }
      if (code !== MOCK_SMS_CODE) {
        smsState[mobile] = { ...sms, failCount: sms.failCount + 1 };
        showToast(tr("codeError"));
        appendLog("sms_logs", `${mobile} 验证码错误 ${sms.failCount + 1}/5`);
        return false;
      }
      smsState[mobile] = { ...sms, failCount: 0 };
      const existing = user?.mobile === mobile ? user : null;
      setUser(
        existing ?? {
          id: `u-${mobile}`,
          mobile,
          role: mobile.endsWith("0000") ? "admin" : "user",
          plan: "free",
          dailyQuota: PLAN_QUOTA.free,
          usedCount: 0,
          bonusQuota: 0,
          videoCoin: 0,
          frozenVideoCoin: 0,
          language: lang,
        }
      );
      setLoginOpen(false);
      showToast(tr("loginSuccess"));
      return true;
    },
    [appendLog, lang, showToast, tr, user]
  );

  const logout = useCallback(() => {
    if (isClientServerMode()) void apiLogout();
    setUser(null);
    localStorage.removeItem(STORAGE_USER);
  }, []);

  const checkQuota = useCallback(
    (type: keyof typeof QUOTA_COST): boolean => {
      const cost = QUOTA_COST[type] ?? 1;
      if (!user) {
        setLoginOpen(true);
        showToast(tr("pleaseLogin"));
        return false;
      }
      const remain = user.dailyQuota - user.usedCount;
      if (remain >= cost || user.bonusQuota >= cost) return true;
      showToast(tr("quotaInsufficient"));
      return false;
    },
    [showToast, tr, user]
  );

  const deductQuota = useCallback(
    (type: keyof typeof QUOTA_COST, reason: string) => {
      const cost = QUOTA_COST[type] ?? 1;
      setUser((u) => {
        if (!u) return u;
        const remain = u.dailyQuota - u.usedCount;
        if (remain >= cost) {
          appendLog("quota_logs", `${reason} 扣除日额度 ${cost} 次`);
          return { ...u, usedCount: u.usedCount + cost };
        }
        appendLog("quota_logs", `${reason} 扣除奖励额度 ${cost} 次`);
        return { ...u, bonusQuota: u.bonusQuota - cost };
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
          addHistory("账号方案", `${input.platform}-${input.track}`, res.result);
        }
        return { result: res.result, risk: res.risk ?? risk };
      }

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
    [addHistory, addRiskRecord, checkQuota, deductQuota, showToast, tr]
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
      if (!checkQuota("daily")) return { risk };

      if (isClientServerMode()) {
        const res = await apiGenerateDaily(topic);
        if (res.error) {
          if (res.error === "quota_insufficient") showToast(tr("quotaInsufficient"));
          else if (res.error === "unauthorized") setLoginOpen(true);
          return { risk: res.risk ?? risk };
        }
        if (res.user) setUser(res.user);
        if (res.result) addHistory("今日视频", topic, res.result);
        return { result: res.result, risk: res.risk ?? risk };
      }

      const result = mockDailyVideo(topic);
      deductQuota("daily", "今日视频");
      addHistory("今日视频", topic, result as Record<string, unknown>);
      return { result, risk };
    },
    [addHistory, addRiskRecord, checkQuota, deductQuota, showToast, tr]
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
        if (res.result) addHistory("爆款同款", title, res.result);
        return { result: res.result, risk: res.risk ?? risk };
      }

      const result = mockViralCopy(title, copy);
      deductQuota("viral", "爆款同款");
      addHistory("爆款同款", title, result as Record<string, unknown>);
      return { result, risk };
    },
    [addHistory, addRiskRecord, checkQuota, deductQuota, showToast, tr]
  );

  const grantBenefit = useCallback((order: Order, u: User): User => {
    const product = PRODUCTS.find((p) => p.productName === order.productName);
    if (!product) return u;
    if (product.productType === "video_coin" && product.coin) {
      return { ...u, videoCoin: u.videoCoin + product.coin };
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
      if (isClientServerMode()) {
        void (async () => {
          const r = await apiCreatePayOrder(product);
          if (r.error) {
            showToast(tr("payFail"));
            return;
          }
          if (r.payUrl) {
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
        meta: { plan: product.plan, quota: product.quota, coin: product.coin },
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
            setOrders((list) =>
              list.map((o) =>
                o.id === order.id
                  ? {
                      ...o,
                      status: "paid" as const,
                      benefitGranted: true,
                      benefitGrantedAt: new Date().toISOString(),
                    }
                  : o
              )
            );
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
      setUser((u) => (u ? grantBenefit(order, u) : u));
      appendLog("order_logs", `订单 ${order.orderNo} paid · benefit_granted=true`);
      setPayOrder(null);
      showToast(tr("paySuccessGranted"));
    },
    [appendLog, grantBenefit, showToast, tr]
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
    (input: {
      type: string;
      contact: string;
      description: string;
      orderNo?: string;
      taskId?: string;
    }) => {
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
        showToast(tr("riskHigh"));
        return false;
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
      histories,
      orders,
      tasks,
      flowLogs,
      toast,
      showToast,
      loginOpen,
      setLoginOpen,
      payOrder,
      setPayOrder,
      videoDraft,
      setVideoDraft,
      sendCode,
      login,
      logout,
      addRiskRecord,
      generateAccount,
      generateDaily,
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
      histories,
      orders,
      tasks,
      flowLogs,
      toast,
      showToast,
      loginOpen,
      payOrder,
      videoDraft,
      sendCode,
      login,
      logout,
      addRiskRecord,
      generateAccount,
      generateDaily,
      generateViral,
      createOrder,
      paySuccess,
      payFail,
      payClose,
      submitFeedback,
      createVideoTask,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
