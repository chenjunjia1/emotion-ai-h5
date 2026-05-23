import type {
  FeatureType,
  GenerateFormData,
  GenerateResult,
  HistoryRecord,
  StyleType,
} from "./types";
import { FEATURE_LABELS } from "./constants";

export function buildMockResult(form: GenerateFormData): GenerateResult {
  const featureLabel = FEATURE_LABELS[form.feature] ?? "私信回复";

  if (form.feature === "video") {
    return {
      feature: form.feature,
      featureLabel,
      style: form.style,
      mainTitle: "爆款标题",
      mainContent: `【前3秒开场】\n你是不是也遇到过：明明条件不差，却总在感情里反复内耗？\n\n【正文】\n${form.input || "相亲这件事，最怕的不是没遇到人，而是遇到不对的人还硬撑着。"}\n\n其实真正适合你的人，不会让你猜来猜去。先学会筛选，再学会相处，比盲目将就更重要。\n\n【结尾互动】\n如果你也认同，评论区告诉我：你最看重的是「条件」还是「相处感」？`,
      variants: [
        {
          title: "评论区首评",
          content:
            "说得对！我现在更愿意慢一点，也不想再为不合适的人内耗了。",
        },
        {
          title: "引导关注版",
          content: "关注我，每天分享一点更清醒的情感观点。",
        },
      ],
    };
  }

  if (form.feature === "comment") {
    return {
      feature: form.feature,
      featureLabel,
      style: form.style,
      mainTitle: "高情商回复",
      mainContent: `【${form.style}版】\n其实很多人不是不想主动，而是怕主动了得不到回应。你累，说明你一直在认真经营关系，这本身就很珍贵。\n\n【幽默版】\n男生不主动？可能是系统在更新「主动功能」，建议给他发个 gentle 提醒：该上线啦。\n\n【引导互动版】\n你更希望对方怎么主动？评论区聊聊，我帮你整理成「可直接复制」的回复话术。`,
      variants: [
        {
          title: "温柔版",
          content:
            "抱抱你，感情里最怕的不是慢，而是只有一个人在努力。你已经很棒了。",
        },
        {
          title: "高情商版",
          content:
            "主动和敷衍是两回事。你值得被认真回应，也值得把精力留给对的人。",
        },
        {
          title: "幽默版",
          content: "他可能不是不主动，是在等你的「已读不回」教学课程 😄",
        },
      ],
    };
  }

  return {
    feature: form.feature,
    featureLabel,
    style: form.style,
    mainTitle: "高情商回复",
    mainContent: `【${form.style}·温柔安抚版】\n我理解你的顾虑，毕竟现在大家做选择都会更谨慎。我们这边不是让你马上决定，而是先根据你的情况做了解和匹配，合适再进一步安排。\n\n【专业解释版】\n关于「${form.input || "服务是否靠谱"}」：流程透明、可试听体验，你有任何疑问都可以先问清楚，再决定要不要继续。\n\n【促进转化版】\n你可以先领一份「匹配说明」，看看是否适合你，不强推、不施压，节奏由你掌握。`,
    variants: [
      {
        title: "温柔安抚版",
        content:
          "你的担心很正常，我们更希望你先了解清楚，再慢慢做决定，不着急。",
      },
      {
        title: "专业解释版",
        content:
          "服务流程、收费标准都会提前说明，没有隐形消费，有疑问随时问。",
      },
      {
        title: "不强销售版",
        content: "合适再继续，不合适也没关系，尊重你的选择和节奏。",
      },
    ],
  };
}

export const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: "1",
    featureType: "private",
    featureLabel: "私信回复",
    userInput: "你们这个服务靠谱吗？感觉有点担心被骗。",
    aiResult:
      "我理解你的顾虑，毕竟现在大家做选择都会更谨慎。我们这边不是让你马上决定，而是先根据你的情况做了解和匹配。",
    style: "高情商",
    createdAt: "2026-05-20T10:22:00",
    displayTime: "今天 10:22",
  },
  {
    id: "2",
    featureType: "comment",
    featureLabel: "评论区回复",
    userInput: "现在男生都不主动了，真的很累。",
    aiResult:
      "其实很多人不是不想主动，而是怕主动了得不到回应。你累，说明你一直在认真经营关系。",
    style: "温柔",
    createdAt: "2026-05-20T09:48:00",
    displayTime: "今天 09:48",
  },
  {
    id: "3",
    featureType: "video",
    featureLabel: "短视频文案",
    userInput: "相亲时女生最看重的不是条件，而是相处感。",
    aiResult:
      "【前3秒开场】你是不是也遇到过：明明条件不差，却总在感情里反复内耗？",
    style: "温柔",
    createdAt: "2026-05-19T21:16:00",
    displayTime: "昨天 21:16",
  },
];

export function getDefaultForm(feature: FeatureType = "private"): GenerateFormData {
  return {
    feature,
    input: "",
    style: "高情商" as StyleType,
    audience: "25-35女生",
  };
}
