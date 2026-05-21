export function mockAccountPackage(input: {
  platform: string;
  track: string;
  goal: string;
  style: string;
}) {
  const { platform, track, goal, style } = input;
  return {
    positioning: `${platform} · ${track} 账号定位：以「${style}」风格服务${goal}目标人群，强调真实、可持续、可转化。`,
    audience: "18-35岁有内容消费需求、愿意互动评论的用户",
    persona: "温柔理性的陪伴型博主，不说教、不贩卖焦虑，用具体场景和可执行建议建立信任。",
    names: [
      "半糖情绪馆",
      "小满成长记",
      "温柔关系研究所",
      "晚风运营局",
      "普通人起号日记",
      "慢慢变好计划",
      "今日选题局",
      "情绪加油站",
      "关系成长笔记",
      "起号实验室",
    ],
    bios: [
      "不讲大道理，只分享真实有用的起号方法。",
      "每天一点点，把短视频账号做起来。",
      "关注我，一起从0开始做内容。",
      "账号定位 · 每日选题 · 脚本成片，一站搞定。",
      "适合新手的短视频运营助手。",
    ],
    homepageKit: "头像：清晰半身/场景图；昵称：2-6字+领域词；简介：一句话价值+更新频率+互动引导",
    pinnedVideo: "置顶：自我介绍60秒 + 你最擅长的3个选题方向",
    monthPlan: "第1周破冰人设，第2周干货信任，第3周互动涨粉，第4周转化试探",
    week7: [
      { day: "第1天", theme: "账号破冰", title: "为什么新手第一周别急着追爆款？", format: "口播" },
      { day: "第2天", theme: "情绪共鸣", title: "不是你太敏感，是你真的被忽略了", format: "口播" },
      { day: "第3天", theme: "互动话题", title: "你能接受对象3小时不回消息吗？", format: "问答" },
      { day: "第4天", theme: "干货", title: "高情商聊天的3个细节", format: "口播" },
      { day: "第5天", theme: "案例", title: "普通人起号第7天真实复盘", format: "口播" },
      { day: "第6天", theme: "引流", title: "为什么评论区比私信更容易转化", format: "口播" },
      { day: "第7天", theme: "总结", title: "新手起号第一周总结清单", format: "口播" },
    ],
    commentReplies: [
      "说得对，我也是从定位模糊开始的",
      "能出个第二版起号清单吗？",
      "太真实了，第一周确实不能急",
    ],
    privateMessages: [
      "你好，我把7天选题清单整理好了，需要的话可以私信「起号」",
      "感谢关注，后续会持续更新每日选题和脚本模板",
    ],
    monetization: "前期以涨粉+私域沉淀为主，第3-4周试探轻咨询/资料包/带货种草",
  };
}

export function mockDailyVideo(topic: string) {
  return {
    topic,
    titles: [
      `新手做账号，第一周别急着追爆款`,
      `普通人起号：${topic}`,
      `为什么你的视频没人看？可能从第一步就错了`,
      `账号做不起来，不是你不努力`,
      `新手起号最容易忽略的3个细节`,
      `${topic} · 3分钟讲清楚`,
      `如果你也卡在起号，先看这条`,
      `从0到1，先把这7条内容发完`,
      `别抄爆款，先跑通你的账号方向`,
      `今天这条，适合刚起号的人`,
    ],
    hook: `如果你也在纠结「${topic}」，先别急着换赛道。`,
    script:
      "很多人一开始做账号，就想着发一条马上爆。其实新号最重要的不是爆，而是让平台和用户看懂你是谁、你讲什么、你能持续给什么价值。",
    storyboard: [
      { shot: 1, desc: "近景口播，抛出反常识问题", duration: "3s" },
      { shot: 2, desc: "中景+B-roll，解释原因", duration: "15s" },
      { shot: 3, desc: "字幕强调关键词", duration: "8s" },
      { shot: 4, desc: "结尾互动提问", duration: "4s" },
    ],
    subtitles: "新手起号 / 账号方向 / 第一周内容计划",
    coverCopy: `新手必看：${topic}`,
    firstComment: "你现在最卡的是选题、拍摄还是文案？评论区说一下。",
    commentReplies: Array.from({ length: 20 }, (_, i) => `互动回复模板 ${i + 1}：感谢分享，我也遇到过类似情况`),
    publishTime: "工作日 12:00-13:00 或 19:00-21:00",
  };
}

export function mockViralCopy(title: string, copy: string) {
  return {
    title,
    analysis: {
      reason: "抓住普通人挫败感 + 反常识开头 + 具体原因承接 + 评论引导",
      hook: "前3秒用「不是你不努力」类反转留住用户",
      emotion: "焦虑 → 共鸣 → 希望",
      structure: "痛点 → 原因 → 方法 → 互动",
      commentGuide: "结尾提问降低评论门槛",
    },
    scripts: [
      copy || "很多人做账号没流量，不是因为不努力，而是一开始定位就太散了。",
      "新手起号最怕的不是没灵感，而是什么都想发。",
      "如果你的账号一直没有起色，先别急着换赛道，先把方向跑清楚。",
    ],
    titles: Array.from({ length: 10 }, (_, i) => `同款标题 ${i + 1}：${title.replace(/？.*/, "")} · 新手版`),
  };
}
