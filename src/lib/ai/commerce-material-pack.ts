import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { generateWithBudget } from "@/lib/ai/generate-budget";

export type CommerceMaterialPackResult = {
  productSummary: string;
  sellingPoints: string[];
  videoScript: string;
  xhsNote: string;
  liveScript: string;
};

function mockPack(product: string): CommerceMaterialPackResult {
  const p = product.slice(0, 16) || "这款好物";
  return {
    productSummary: `围绕「${p}」做种草转化，突出痛点解决 + 限时优惠感。`,
    sellingPoints: [
      "核心成分/工艺一句话讲清，降低决策成本",
      "对比市面同类，强调性价比或差异化",
      "真实使用场景：谁适合、什么时候用",
      "限时福利：下单理由（赠品/包邮/满减）",
    ],
    videoScript: `【0-3s 钩子】还在纠结${p}怎么选？\n【3-15s 痛点】你是不是也遇到过……\n【15-40s 卖点】这款${p}我最看重三点：……\n【40-55s 证明】我自己/身边朋友用下来……\n【55-60s 行动】链接在评论区，今天下单还有……`,
    xhsNote: `标题：${p}真的值得入吗？亲测不踩雷✨\n\n姐妹们！今天必须给你们安利这款${p}～\n\n先说结论：适合XXX人群，不适合XXX。\n\n✅ 亮点1\n✅ 亮点2\n✅ 亮点3\n\n使用感受：……\n\n#好物分享 #种草 #${p.slice(0, 6)}`,
    liveScript: `【开场 30s】家人们晚上好，今天给大家带来${p}，先别划走～\n【痛点 1min】你们是不是也……\n【演示 2min】你看这个细节……\n【价格 1min】今天直播间专属价……\n【逼单 30s】库存就这些，拍完没有了，想要的扣1`,
  };
}

function normalize(raw: Record<string, unknown>, product: string): CommerceMaterialPackResult {
  const fallback = mockPack(product);
  const sellingPoints = Array.isArray(raw.sellingPoints)
    ? raw.sellingPoints.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
    : fallback.sellingPoints;

  return {
    productSummary: String(raw.productSummary ?? fallback.productSummary).trim() || fallback.productSummary,
    sellingPoints: sellingPoints.length ? sellingPoints : fallback.sellingPoints,
    videoScript: String(raw.videoScript ?? fallback.videoScript).trim() || fallback.videoScript,
    xhsNote: String(raw.xhsNote ?? fallback.xhsNote).trim() || fallback.xhsNote,
    liveScript: String(raw.liveScript ?? fallback.liveScript).trim() || fallback.liveScript,
  };
}

export async function generateCommerceMaterialPack(product: string): Promise<{
  commercePack: CommerceMaterialPackResult;
  usedMock: boolean;
}> {
  const text = product.trim() || "日用好物";
  const { result, usedMock } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.expression_commerce_pack,
    system: `你是电商带货内容总监，熟悉抖音短视频、小红书种草、直播间话术。
用户输入商品信息。只输出 JSON：
productSummary(30字内商品一句话定位),
sellingPoints(4-5条卖点，每条15-25字，口语),
videoScript(60秒内短视频口播脚本，分段标注【钩子】【痛点】【卖点】【行动】，用\\n换行),
xhsNote(小红书笔记正文，含标题感首行、分段、emoji、3-5个标签),
liveScript(2-3分钟直播话术，分段标注【开场】【演示】【价格】【逼单】，用\\n换行)。
真实、可拍、不虚假宣传。禁止【Mock】占位符。`,
    user: JSON.stringify({ product: text }),
    mock: () => mockPack(text) as unknown as Record<string, unknown>,
    normalize: (raw) => normalize(raw, text) as unknown as Record<string, unknown>,
  });

  return { commercePack: result as unknown as CommerceMaterialPackResult, usedMock };
}
