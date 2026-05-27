/**

 * AI灵感 — 客户端 API 封装

 */



import { isClientServerMode } from "@/lib/client/server-api";

import type {

  ChatOcrRequest,

  ChatOcrResponse,

  ExpressionGenerateRequest,

  ExpressionGenerateResponse,

  HotTopicsResponse,

  ImageCaptionRequest,

  ImageCaptionResponse,

} from "./types";



const BASE = "/api/v2/expression";



export class ExpressionApiError extends Error {

  constructor(

    public code: string,

    public status: number,

    message?: string

  ) {

    super(message ?? code);

    this.name = "ExpressionApiError";

  }

}



async function postJson<T>(path: string, body: unknown): Promise<T> {

  const res = await fetch(`${BASE}${path}`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(body),

  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string };

  if (!res.ok) {

    throw new ExpressionApiError(

      String(data.error ?? "request_failed"),

      res.status,

      data.message

    );

  }

  return data;

}



export async function apiExpressionGenerate(

  req: ExpressionGenerateRequest

): Promise<ExpressionGenerateResponse> {

  if (isClientServerMode()) {

    return postJson<ExpressionGenerateResponse>("/generate", req);

  }

  return mockExpressionGenerate(req);

}



export async function apiImageCaption(

  req: ImageCaptionRequest

): Promise<ImageCaptionResponse> {

  if (isClientServerMode()) {

    return postJson<ImageCaptionResponse>("/image-caption", req);

  }

  return mockImageCaption();

}



export async function apiChatOcr(req: ChatOcrRequest): Promise<ChatOcrResponse> {

  if (isClientServerMode()) {

    return postJson<ChatOcrResponse>("/chat-ocr", req);

  }

  return {

    ok: true,

    messages: [

      { role: "other", text: "在吗？" },

      { role: "me", text: "在的～" },

    ],

  };

}



export async function apiHotTopics(): Promise<HotTopicsResponse> {

  try {

    const res = await fetch(`${BASE}/hot-topics`, { cache: "no-store", credentials: "include" });

    if (!res.ok) throw new Error("hot-topics failed");

    return res.json() as Promise<HotTopicsResponse>;

  } catch {

    const { INSPIRATION_HOT_RANK } = await import("@/lib/mock/expression-assistant");

    return {

      ok: true,

      items: INSPIRATION_HOT_RANK.map((h, i) => ({

        id: `hot-${i}`,

        title: h.title,

        heat: h.heat,

        platform: "all" as const,

      })),

      updatedAt: new Date().toISOString(),

    };

  }

}



function mockExpressionGenerate(

  req: ExpressionGenerateRequest

): ExpressionGenerateResponse {

  const base = req.prompt?.trim() || "今天想表达点什么";

  if (req.kind === "chat_reply") {

    return {

      ok: true,

      replies: [

        `收到～关于「${base}」，我建议自然接一句，再抛个轻松问题。`,

        "哈哈懂你，那等你忙完我们再聊？",

      ],

      analysis: {

        attitude: "友好",

        relation: "熟悉",

        mood: "轻松",

      },

      quotaCost: 8,

      usedMock: true,

    };

  }

  if (req.kind === "emotion_sign") {

    return {

      ok: true,

      text: base
        ? `懂你，「${base.slice(0, 24)}」放谁身上都会不舒服。先别急着怪自己，我在呢。`
        : "你不是矫情，你只是累了。乱七八糟地说也可以，我听着。",

      tags: ["今日状态：电量不足", "情绪天气：小雨转多云"],

      quotaCost: 6,

      usedMock: true,

    };

  }

  if (req.kind === "account_diagnosis") {
    const p = base || "生活号";
    return {
      ok: true,
      diagnosis: {
        summary: `「${p}」适合「真实感 + 轻干货」路线，先涨粉再变现。`,
        contentDirection: [
          "固定人设：每篇用同一句开场白强化记忆",
          "70% 生活记录 + 30% 可复制方法",
          "用评论区收集下一期选题",
          "每周 1 条复盘增强信任",
        ],
        hotTopics: [
          `${p}起号第 1 周该发什么`,
          `普通人做${p}的 5 个低门槛选题`,
          `${p}千万别踩的 3 个坑`,
          `一条内容讲清${p}怎么变现`,
          `${p}爆款标题万能公式`,
          `从 0 到 1000 粉，${p}实操记录`,
        ],
        publishPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          theme: `Day ${i + 1}`,
          content: i === 0 ? `定位说明 + ${p}自我介绍` : `${p}主题内容 + 实用技巧`,
          tip: "封面 3:4，标题 15 字内",
        })),
        monetization: [
          "500 粉：同城/同类置换合作",
          "3000 粉：资料包或选题库",
          "稳定更新：轻咨询或陪跑社群",
          "有案例后：按篇品牌软广报价",
        ],
      },
      quotaCost: 25,
      usedMock: true,
    };
  }

  if (req.kind === "commerce_pack") {
    const p = base || "好物";
    return {
      ok: true,
      commercePack: {
        productSummary: `「${p}」主打痛点场景 + 性价比，适合短视频种草转化。`,
        sellingPoints: [
          "一句话讲清核心功效，降低选择成本",
          "对比同类突出差异化亮点",
          "真实场景：谁用、什么时候用",
          "下单理由：福利/包邮/限时",
        ],
        videoScript: `【钩子】${p}值不值得买？先说结论！\n【痛点】你是不是也遇到过……\n【卖点】三点告诉你为什么选它……\n【行动】链接在评论区，今天下单更划算`,
        xhsNote: `标题：${p}亲测｜不踩雷种草笔记\n\n姐妹们今天分享${p}～\n\n✅ 亮点总结\n✅ 使用感受\n\n#好物分享 #种草`,
        liveScript: `【开场】家人们，今天${p}专场\n【演示】看这个细节……\n【价格】直播间专属价\n【逼单】库存有限，想要的扣1`,
      },
      quotaCost: 28,
      usedMock: true,
    };
  }

  return {

    ok: true,

    text: `${base}\n\n今天不想卷，只想把生活调成喜欢的滤镜。慢一点也没关系，你已经在路上了。`,

    titles: [`${base}｜高级感文案`, `关于${base}，我想这样说`],

    tags: ["治愈", "生活感", "高级感"],

    quotaCost: 10,

    usedMock: true,

  };

}



function mockImageCaption(): ImageCaptionResponse {

  return {

    ok: true,

    moments: "今天的光很软，心情也被温柔包围了。",

    xhs: "氛围感日常｜把普通日子过成喜欢的样子 ✨",

    wechatStatus: "慢慢变好",

    moodScore: 86,

  };

}



export function expressionErrorMessage(code: string): string {

  switch (code) {

    case "unauthorized":

      return "请先登录后再生成";

    case "quota_insufficient":

      return "灵感不足，请充值或开通会员";

    case "feature_vip":

      return "该功能为会员专享，开通 Pro 即可使用";

    case "server_backend_disabled":

      return "服务暂不可用，请稍后再试";

    case "generate_failed":

      return "生成失败，请重试";

    case "image_required":

      return "请先上传一张图片";

    default:

      return "请求失败，请稍后再试";

  }

}


