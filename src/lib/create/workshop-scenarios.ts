export const REPLY_COMMENT_POOL = [
  "博主你好，我也想开始做账号但不知道从哪入手",
  "说的太真实了，我也是这样😭",
  "能出个第二版吗？已收藏",
  "煮了的课值得买吗？",
  "已关注，求资料包",
  "这条怎么拍的？想学",
  "感觉就是在说我本人",
  "有没有适合新手的起号清单？",
  "评论区吵起来了，我该怎么回？",
  "有人质疑是广告，怎么高情商回应？",
  "粉丝问能不能合作，怎么婉拒又不得罪人",
  "这条数据一般，帮我看看标题问题",
] as const;

export const VIRAL_PRESETS = [
  {
    title: "普通人做账号，为什么越努力越没流量？",
    copy: "很多人做账号没流量，不是因为不努力，而是一开始定位就太散了。",
  },
  {
    title: "打工人周三能量低谷怎么破",
    copy: "前3秒用「你是不是也…」开场，中间给3个可执行小动作，结尾留互动问题。",
  },
  {
    title: "本地探店人均50宝藏小馆",
    copy: "镜头先给门头+排队画面，口播强调「人均50」和「避开网红坑」。",
  },
  {
    title: "为什么越晒收入越容易掉粉",
    copy: "用反常识观点开场，再讲信任感比炫富更重要的3个原因。",
  },
] as const;

export const SCORE_PRESETS = [
  {
    title: "打工人周三能量低谷怎么破",
    script: "你是不是每到周三就提不起劲？今天给你3个5分钟就能做的小恢复动作…",
  },
  {
    title: "新手做账号第一周怎么发",
    script: "第一周别追爆款，先完成3条同系列内容，让平台知道你是谁…",
  },
] as const;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shuffleSeeded<T>(arr: T[], seedKey: string): T[] {
  const out = [...arr];
  let seed = hashSeed(seedKey);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getDailyReplyComments(dateKey: string, batch = 0, take = 8): string[] {
  return shuffleSeeded([...REPLY_COMMENT_POOL], `${dateKey}-reply-${batch}`).slice(0, take);
}

export const TAB_META = {
  reply: {
    emoji: "💬",
    grad: "from-[#FFB88C] via-[#FF9A6B] to-[#FF7AAE]",
    costKey: "reply" as const,
    hintKey: "createReplyHint",
  },
  viral: {
    emoji: "🔥",
    grad: "from-orange-400 via-[#FF6B6B] to-rose-500",
    costKey: "viral" as const,
    hintKey: "createViralHint",
  },
  score: {
    emoji: "📈",
    grad: "from-violet-400 via-[#FF7AAE] to-[#FFC46B]",
    costKey: "score" as const,
    hintKey: "createScoreHint",
  },
  pack: {
    emoji: "⚡",
    grad: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
    costKey: "publish_pack" as const,
    hintKey: "createPackHint",
  },
} as const;
