/** 小红书笔记创作页 — 2025/2026 热门提示词 */

export type XhsNoteStyle = "干货" | "种草" | "氛围" | "测评" | "vlog";

export const XHS_NOTE_STYLE_OPTIONS: { id: XhsNoteStyle; label: string; emoji: string }[] = [
  { id: "干货", label: "干货清单", emoji: "📋" },
  { id: "种草", label: "种草安利", emoji: "🌱" },
  { id: "氛围", label: "氛围感", emoji: "✨" },
  { id: "测评", label: "真实测评", emoji: "🔍" },
  { id: "vlog", label: "日常 vlog", emoji: "📹" },
];

/** 最新/热门小红书选题提示（可定期更新） */
export const XHS_NOTE_PROMPT_CHIPS: { text: string; tag?: string }[] = [
  { text: "秋冬护肤ROUTINE，学生党平价", tag: "爆款" },
  { text: "通勤穿搭一周不重样，小个子友好", tag: "OOTD" },
  { text: "咖啡店探店，拍照机位+点单攻略", tag: "探店" },
  { text: "租房改造前后对比，预算 500 内", tag: "家居" },
  { text: "减脂便当 7 天食谱，打工人带饭", tag: "美食" },
  { text: "平价彩妆全套，黄皮友好不踩雷", tag: "美妆" },
  { text: "周末 citywalk 路线，人少好拍", tag: "旅行" },
  { text: "新手健身入门，居家无器械", tag: "运动" },
  { text: "猫咪日常 vlog，治愈系碎碎念", tag: "萌宠" },
  { text: "考研/考公上岸经验，时间线分享", tag: "成长" },
  { text: "护肤品空瓶回购清单，真实不广", tag: "测评" },
  { text: "新年开运妆容，氛围感拉满", tag: "节日" },
  { text: "早八快速出门妆，5 分钟搞定", tag: "热门" },
  { text: "小众香水测评，男女中性香", tag: "好物" },
  { text: "断舍离 30 件，极简生活记录", tag: "生活方式" },
];

export const XHS_NOTE_EXAMPLE_SNIPPETS = [
  "「秋冬护肤 ROUTINE｜学生党也能抄的平价清单 ✨」",
  "「小个子通勤一周穿搭｜显高不踩雷 📌」",
  "「这家咖啡店也太好拍了！附机位+点单攻略 ☕」",
];

export const XHS_HOT_TAGS_HINT = ["好物分享", "氛围感", "干货", "OOTD", "探店", "生活方式"];
