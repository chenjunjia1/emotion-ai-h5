const TOPIC_POOL = [
  "为什么越想把账号做好，越容易发不出内容？",
  "普通人做账号，第一周千万别急着追爆款",
  "小红书新手最容易踩的3个坑",
  "不是你不会做内容，是你没有内容节奏",
  "为什么你越努力发，数据越差？",
  "账号没流量，可能不是内容差，而是钩子太弱",
  "今天适合发一条「反焦虑起号」内容",
  "宠物博主怎么在30秒内让人想关注？",
  "本地生活账号，第一条视频该怎么拍？",
];

import { getDailyHotTopics } from "@/lib/hot-topics/resolve-daily";

const TITLE_TYPES = ["反差型", "痛点型", "情绪型", "干货型", "种草型"] as const;

export function mockTopicBlindBox(input: {
  platform: string;
  track: string;
  goal: string;
  style: string;
}) {
  const topic =
    TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)] ??
    TOPIC_POOL[0];
  const isXhs = input.platform.includes("小红书");
  return {
    topic,
    format: isXhs ? "小红书图文" : "30秒口播",
    track: input.track,
    angle: `从「${input.style}」风格切入，讲${input.goal}人群的真实困境，给出可执行的小步骤。`,
    titleHint: `新手必看：${topic.slice(0, 12)}…`,
    whyToday: "反常识 + 低门槛 + 易引发评论，适合工作日午间或晚间发布。",
    platform: input.platform,
    goal: input.goal,
    style: input.style,
  };
}

export function mockTitleGacha(input: {
  platform: string;
  track: string;
  theme: string;
  style: string;
  goal: string;
}) {
  const base = input.theme || input.track;
  const titles = [
    `不是你不会做账号，是你一开始就选错了方向`,
    `普通人做账号，第一周千万别急着追爆款`,
    `账号没流量，可能不是内容差，而是钩子太弱`,
    `${input.track}新手最容易踩的3个坑`,
    `为什么你越努力发，数据越差？`,
  ].map((t, i) => ({
    text: t.replace("账号", base.includes("账号") ? base : `${base}账号`),
    type: TITLE_TYPES[i % TITLE_TYPES.length],
  }));
  const pick = 2;
  return {
    titles,
    recommendedIndex: pick,
    recommended: titles[pick].text,
    reason: "有明确痛点、带反常识、适合新手停留，也容易引发评论。",
    input,
  };
}

export function mockPublishPack(input: {
  topic: string;
  platform: string;
  track: string;
  goal: string;
  style: string;
  withXhs?: boolean;
}) {
  const { topic, platform, track, withXhs } = input;
  const titles = [
    `新手做账号，第一周别急着追爆款`,
    `${topic}`,
    `普通人起号：${topic.slice(0, 10)}`,
    `如果你也卡在起号，先看这条`,
    `别抄爆款，先跑通你的${track}方向`,
    `今天这条，适合刚起号的人`,
    `${track} · 3分钟讲清楚`,
    `为什么你的内容没人看？`,
  ];
  const recommended = titles[1];
  const script = `【前3秒】如果你也在纠结「${topic}」，先别急着换赛道。\n\n【正文】很多人一开始做账号，就想着发一条马上爆。其实新号最重要的是让平台和用户看懂你是谁、你讲什么、你能持续给什么价值。今天用${track}赛道举个例子：先定一个方向，再连续发7条同类型内容，比每天换一个选题更容易起量。\n\n【结尾互动】你现在最卡的是选题、文案还是不敢发？评论区说一下。`;
  const xhsNote = withXhs
    ? `📌 ${recommended}\n\n${topic}\n\n✅ 适合人群：想做${track}的新手\n✅ 今天就能照做的3步：\n1. 先确定一个主线选题\n2. 用同一风格连发3条\n3. 每条结尾留一个问题\n\n#${track} #起号 #运营陪跑`
    : undefined;
  return {
    packName: "完整发布包",
    topic,
    platform,
    track,
    titles,
    recommendedTitle: recommended,
    script30s: script,
    xhsNote,
    coverCopy: `新手必看｜${topic.slice(0, 12)}`,
    firstComment: "你现在最卡的是选题、拍摄还是文案？评论区说一下。",
    commentReplies: [
      "说得太真实了，我也是从定位模糊开始的",
      "能出个第二版清单吗？",
      "收藏了，今晚就按这个发",
      "第一条就踩坑了，感谢",
      "已关注，等更新",
    ],
    tags: [`#${track}`, "#起号", "#运营陪跑", "#短视频", "#创作灵感"],
    publishTime: "工作日 12:00-13:00 或 19:00-21:00",
    publishTips: "发布前检查敏感词；标题与封面关键词一致；首评30分钟内发布效果更好。",
    safetyScore: 86,
    safetyLevel: "低",
  };
}

export function mockAccountPersonalityTest(answers: Record<string, string>) {
  const face = answers.q1 === "愿意";
  const time = answers.q2 || "1小时";
  const directions = [
    {
      name: `${answers.q5 || "职场成长"} · 干货陪伴型`,
      platform: answers.q7?.includes("图文") ? "小红书" : "抖音",
      format: answers.q7?.includes("图文") ? "图文笔记" : "口播短视频",
      difficulty: "中等",
      monetize: "咨询/资料包/私域",
    },
    {
      name: "个人IP · 真实故事型",
      platform: "视频号",
      format: "口播 + 轻图文",
      difficulty: face ? "较低" : "中等",
      monetize: "课程/服务预约",
    },
    {
      name: "本地生活 · 探店引流型",
      platform: "抖音",
      format: "探店短视频",
      difficulty: "中等",
      monetize: "团购/到店",
    },
  ];
  return {
    directions,
    recommended: directions[0],
    week1: [
      "第1天：自我介绍 + 账号方向",
      "第2天：痛点共鸣选题",
      "第3天：干货清单",
      "第4天：互动问答",
      "第5天：小案例",
      "第6天：方法论总结",
      "第7天：一周复盘",
    ],
    personaKeywords: ["真实", "可执行", "不焦虑", answers.q8 || "温柔"],
    answers,
    timeBudget: time,
  };
}

export function mockHotTopics(dateKey: string, batch = 0) {
  return getDailyHotTopics(dateKey, batch);
}

export function mockViralScore(input: {
  title: string;
  script: string;
  xhs?: string;
}) {
  const len = (input.title + input.script).length;
  const base = Math.min(92, 68 + (len % 20));
  return {
    totalScore: base,
    hookScore: Math.min(95, base + 4),
    emotionScore: Math.min(93, base - 2),
    commentScore: Math.min(90, base - 5),
    riskLevel: base > 85 ? "低" : "中",
    tips: [
      "前3秒再加一个具体数字或反差词",
      "结尾提问降低评论门槛",
      "标题与封面关键词保持一致",
    ],
    proTips:
      base >= 80
        ? ["尝试「痛点+反常识+解决方案」三段式", "增加一条神评论预埋"]
        : ["标题建议改为痛点型", "脚本前两句需要更强钩子"],
  };
}

export function mockGodReplies(comment: string) {
  return {
    comment,
    replies: [
      { style: "温柔版", text: `看到你的留言啦～${comment.slice(0, 8)}这件事很多人都有同感，慢慢来会好的💛` },
      { style: "高互动版", text: `哈哈哈太真实了！你更倾向哪种做法？A还是B，评论区告诉我` },
      { style: "幽默版", text: `这条评论我先收藏了，下次直播当案例讲😄` },
      { style: "引导关注版", text: `我整理了一份清单，关注我后私信「资料」就能领取～` },
      { style: "合规私域版", text: `更多细节在主页置顶笔记里，欢迎自取；也可在简介找到官方入口` },
    ],
  };
}

export function mockPostReview(input: Record<string, string | number>) {
  const views = Number(input.views) || 0;
  const likes = Number(input.likes) || 0;
  const comments = Number(input.comments) || 0;
  const saves = Number(input.saves) || 0;
  const shares = Number(input.shares) || 0;
  const completionRate = Number(input.completionRate) || 0;
  const title = String(input.title ?? "").trim() || "未命名内容";
  const er = views > 0 ? likes / views : 0;

  let performanceScore = 78;
  if (views > 0) {
    const viewScore = Math.min(45, Math.log10(Math.max(views, 10)) * 12);
    const erScore = Math.min(55, er * 1200);
    performanceScore = Math.min(99, Math.max(35, Math.round(viewScore + erScore)));
  }
  if (completionRate > 0 && completionRate < 35) performanceScore = Math.max(35, performanceScore - 8);
  if (comments > likes * 0.15) performanceScore = Math.min(99, performanceScore + 3);

  const titleScore = Math.min(95, Math.max(55, performanceScore + (title.length % 7) - 3));
  const pacingScore = Math.min(92, Math.max(50, performanceScore - 4 + (completionRate > 40 ? 5 : 0)));
  const interactionScore = Math.min(
    90,
    Math.max(45, Math.round(performanceScore * 0.85 + (comments + saves) / Math.max(views, 1) * 200))
  );

  const problems: string[] = [];
  if (er < 0.03) problems.push("点赞/播放比偏低，结尾互动钩子可加强");
  if (views < 500) problems.push("曝光偏少，标题与封面可再强化点击欲");
  if (completionRate > 0 && completionRate < 40) problems.push("完播率偏低，前3秒钩子需要更强");
  if (problems.length === 0) problems.push("可尝试固定发布时间，培养粉丝习惯");

  const nextTopics = [
    "为什么你越努力发，数据越差？",
    "前3秒钩子：5个模板直接套用",
    "普通人做自媒体的3个真相",
    "打工人周三发什么最容易被收藏",
  ];
  const nextTopic = nextTopics[title.length % nextTopics.length] ?? nextTopics[0];

  const advantages =
    performanceScore >= 75
      ? `选题「${title.slice(0, 12)}」有共鸣，${comments > 0 ? "评论互动不错，" : ""}内容节奏整体顺畅。`
      : "内容方向有基础盘，账号类型与选题匹配度尚可。";

  const coreProblems =
    completionRate > 0 && completionRate < 40
      ? "前3秒钩子偏弱，完播率拖后腿，标题吸引力还有提升空间。"
      : er < 0.03
        ? "互动率偏低，首评预埋与结尾提问需要加强。"
        : "曝光与互动仍有优化空间，建议强化开头与标题。";

  return {
    performanceScore,
    titleScore,
    pacingScore,
    interactionScore,
    titleScoreLabel: titleScore >= 80 ? "好" : titleScore >= 65 ? "一般" : "偏低",
    pacingScoreLabel: pacingScore >= 80 ? "好" : pacingScore >= 65 ? "一般" : "偏低",
    interactionScoreLabel:
      interactionScore >= 80 ? "好" : interactionScore >= 65 ? "一般" : "偏低",
    advantages,
    coreProblems,
    summary:
      performanceScore >= 75
        ? `「${title.slice(0, 16)}${title.length > 16 ? "…" : ""}」方向对了！互动率约 ${(er * 100).toFixed(1)}%，可复用这套结构再发 2 条。`
        : `内容有基础盘，但前3秒钩子或发布时间还有优化空间。当前互动率约 ${(er * 100).toFixed(1)}%。`,
    problems,
    nextSuggestion:
      performanceScore >= 70
        ? "下一条：同系列选题 + 更强首评预埋，发布时间往晚高峰挪 1 小时试试。"
        : "下一条建议用「反常识痛点」标题 + 结尾留开放式问题，并尝试 19:00–22:00 发布。",
    nextTopic,
    engagementRate: Math.round(er * 1000) / 10,
    hookAdvice: "开头 3 秒用具体场景或数字，降低划走率。",
    publishTimeAdvice: String(input.publishTime || "晚上 19-22点") + " 发布更容易获得初始流量。",
    titleAdvice: "标题加入痛点词或反差结构，提升点击率。",
    input,
  };
}

export function mockEmotionChat(input: {
  chat: string;
  relationship: string;
  goal: string;
  style: string;
}) {
  const chat = input.chat.trim();
  const snippet = chat.slice(0, 24) || "对方的消息";
  const seed =
    chat.length +
    input.relationship.length +
    input.goal.length +
    input.style.length;
  const heartbeat = Math.min(98, 48 + (seed % 42));

  const stageByRel: Record<string, string> = {
    暧昧中: "暧昧试探期",
    热恋期: "甜蜜稳定期",
    冷淡期: "冷淡观察期",
    异地恋: "异地维系期",
    "朋友以上": "友达以上期",
    分手恢复期: "疗愈观察期",
    稳定长期: "长期陪伴期",
  };

  const stage = stageByRel[input.relationship] ?? "关系磨合期";

  const insightByGoal: Record<string, string> = {
    增进好感: "对方在等你给「情绪回应」，不是长篇大道理。先接住感受，再轻轻推进。",
    化解误会: "别急着解释对错，先承认他的感受被看见了，误会会自己松一半。",
    体面邀约: "邀约要像「顺便一提」，给台阶、给退路，比硬约更高级。",
    挽回冷淡: "冷淡期最怕连环追问。一条轻量、无压力的关心，比十句解释有用。",
    建立边界: "温柔但清晰：你可以在乎，也可以说不。边界感反而让人更安心。",
    试探心意: "用轻玩笑或小假设试探，比直接问「你喜欢我吗」压力小一半。",
    延续话题: "别只回结论，抛一个具体细节让对方好接，对话就活了。",
  };

  const stylePrefix: Record<string, string> = {
    甜宠体贴: "乖，我懂你的意思～",
    理性沟通: "我们先把感受说清楚：",
    幽默化解: "哈哈哈你这波我接住了，",
    高冷克制: "收到。简单说两句：",
    俏皮调侃: "行行行，你这波操作我懂😏",
  };

  const prefix = stylePrefix[input.style] ?? "";

  return {
    chat,
    relationship: input.relationship,
    goal: input.goal,
    style: input.style,
    stage,
    heartbeat,
    heartbeatLabel:
      heartbeat >= 80 ? "心动爆表" : heartbeat >= 60 ? "有戏" : heartbeat >= 40 ? "观望中" : "需升温",
    insight: insightByGoal[input.goal] ?? "先共情，再表达立场，最后留一个轻互动钩子。",
    tips: [
      "24 小时内回复，比「完美措辞」更重要",
      "避免连环追问，一条消息只解决一个情绪点",
      input.goal === "挽回冷淡" ? "可以发「看到xx想起你」式轻话题，不逼对方表态" : "结尾留开放式小问题，方便对方接话",
    ],
    replies: [
      {
        tone: "稳妥版",
        text: `${prefix}看到你的消息啦。关于「${snippet}${chat.length > 24 ? "…" : ""}」，我理解你的感受，我们慢慢聊～`,
      },
      {
        tone: "高互动版",
        text: `${prefix}这条我认真看了！你更在意的是 A 还是 B？回我个表情也行😊`,
      },
      {
        tone: "进阶版",
        text: `${prefix}要不这样：你方便的时候我们语音 5 分钟？比打字更不容易误会。`,
      },
    ],
  };
}

export function mockOperationConsultant(input: {
  chat: string;
  relationship: string;
  goal: string;
  style: string;
}) {
  const q = input.chat.trim().slice(0, 40) || "起号";
  return {
    analysis: `围绕「${q}」：建议先锁定一个细分赛道（如治愈日常/职场成长），用真实 vlog 拍 3 条测试完播。标题用「数字+反差+结果」，前 3 秒直接抛痛点。`,
    todayTopics: ["下班后的治愈时刻", "普通人30天改变", "一人食探店vlog"],
    titleSuggestions: [
      "打工人下班后的第1小时，我在做什么",
      "30天微小改变，生活真的不一样了",
      "别卷了，这样发日常反而更涨粉",
    ],
    contentStructure: ["0-3s 抛痛点", "4-20s 展示过程", "21-30s 提问互动"],
    publishTips: ["19:00-22:00 发布", "首评预埋开放式问题"],
    recommendPublishPack: true,
    recommendHotTopic: "下班后的治愈时刻",
  };
}

export function mockInviteBlindBox(): {
  type: "quota" | "formula" | "content_pack";
  label: string;
  amount?: number;
} {
  const pool = [
    { type: "quota" as const, label: "+5 灵感", amount: 5 },
    { type: "quota" as const, label: "+10 灵感", amount: 10 },
    { type: "formula" as const, label: "解锁 1 张爆款公式卡" },
    { type: "content_pack" as const, label: "解锁 1 次本周内容包体验" },
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
