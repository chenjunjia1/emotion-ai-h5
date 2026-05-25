/**
 * 根据热点标题 + 分类生成 Pexels 英文搜索词（标题优先，分类兜底）
 */

const TITLE_RULES: { re: RegExp; query: string }[] = [
  { re: /烧烤|烤肉|串串|火锅|小吃|美食|吃货|探店|餐饮|BBQ/, query: "barbecue food aesthetic lifestyle" },
  { re: /夏天.*不完美|不完美.*夏天|不完美也很美/, query: "summer golden hour portrait aesthetic" },
  { re: /夏天.*味道|味道.*治愈|清爽.*日常/, query: "summer iced drink cozy lifestyle aesthetic" },
  { re: /开心|长生不老|快乐|比.*重要/, query: "happy portrait sunlight lifestyle aesthetic" },
  { re: /夏天|夏日|夏季|清爽/, query: "summer lifestyle aesthetic sunlight" },
  { re: /旅行|出游|出发|风景|周末|海边|度假/, query: "city travel lifestyle aesthetic" },
  { re: /宠物|猫咪|猫|小狗|狗狗|萌宠/, query: "cute pet cozy home" },
  { re: /穿搭|OOTD|造型|衣服|衣橱|时尚|舞台/, query: "fashion outfit street style" },
  { re: /街拍|氛围感|男生|女生|人像|拍照|出片/, query: "street portrait aesthetic lifestyle" },
  { re: /普通男生|男孩|男士/, query: "young man street portrait aesthetic" },
  { re: /职场|上班|打工人|电脑|办公室|面试|工资|通勤|下班/, query: "office desk lifestyle" },
  { re: /咖啡|下午茶|窗边|书桌|普通下午|记录/, query: "coffee shop cozy lifestyle" },
  { re: /恋爱|情侣|告白|分手|暗恋/, query: "couple emotion lifestyle" },
];

/** 分类 Tab / 入库 category → 默认搜索词 */
const CATEGORY_DEFAULT: Record<string, string> = {
  治愈日常: "soft sunlight cozy lifestyle",
  治愈: "soft sunlight cozy lifestyle",
  情感: "couple emotion lifestyle",
  美食打卡: "food cafe lifestyle",
  美食: "food cafe lifestyle",
  咖啡生活: "coffee shop lifestyle",
  生活: "cozy home lifestyle aesthetic",
  旅行出片: "travel city aesthetic",
  宠物萌系: "cute cat dog pet",
  宠物: "cute cat dog pet",
  穿搭变美: "fashion outfit street style",
  穿搭: "fashion outfit street style",
  城市生活: "city lifestyle street",
  恋爱情绪: "couple emotion lifestyle",
  职场嘴替: "office worker desk",
  职场: "office worker desk",
  学生: "study desk cozy lifestyle",
  成长: "self growth lifestyle",
  探店: "cafe food aesthetic",
  副业: "laptop workspace lifestyle",
};

const FALLBACK_QUERY = "aesthetic lifestyle cozy sunlight";

function normalizeCategory(category: string): string {
  return category.trim().replace(/号$/u, "");
}

/** 标题 + 分类 → Pexels 搜索关键词（英文） */
export function getTopicImageKeyword(title: string, category = ""): string {
  const t = title.trim();
  for (const rule of TITLE_RULES) {
    if (rule.re.test(t)) return rule.query;
  }

  const cat = normalizeCategory(category);
  if (cat && CATEGORY_DEFAULT[cat]) return CATEGORY_DEFAULT[cat];

  const hay = `${cat} ${t}`;
  for (const rule of TITLE_RULES) {
    if (rule.re.test(hay)) return rule.query;
  }

  return FALLBACK_QUERY;
}
