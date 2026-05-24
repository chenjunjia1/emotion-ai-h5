import { LegalSection } from "@/components/legal-section";
import { LegalShell } from "@/components/layout/legal-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function RightsAgreementPage() {
  return (
    <LegalShell title="会员与灵感规则">
      <Card>
        <CardContent>
          <LegalSection
            title="一、会员套餐（V1）"
            paragraphs={[
              "免费版：每日 3 点灵感（今日灵感，0 点刷新）。",
              "Pro 会员（¥39/30天）：每日 40 点灵感；发布包、选题盲盒、情绪聊天、复盘等 AI 创作全开。",
              "高级会员（¥99/30天）：每日 120 点灵感；含 Pro 全部能力，另享账号方案、7 天内容计划、深度复盘等（以产品内展示为准）。",
              "工作室版（¥299/30天）：每日 500 点灵感；适合高频创作与代运营场景。",
              "Pro 年卡（¥299/365天）：每日 40 点灵感，权益同 Pro 月卡，有效期 365 天。",
              "灵感加油包：一次性购买奖励灵感（如 50 点/200 点），不过期，与会员每日灵感叠加。",
            ]}
          />
          <LegalSection
            title="二、灵感消耗（成功才扣）"
            paragraphs={[
              "选题盲盒、神回复：各 1 点灵感。",
              "情绪聊天、发完复盘：各 2 点灵感。",
              "爆品内容包、爆款拆解：各 3 点灵感。",
              "完整发布包、账号方案：各 5 点灵感。",
              "免费用户每日 3 点灵感，不足以完成 1 次完整发布包（5 点），可体验盲盒或爆品包。",
              "生成成功才扣灵感；风控拦截或系统失败不扣。",
              "先扣今日灵感，不足再扣奖励灵感；邀请与活动获得的为奖励灵感。",
              "邀请奖励：好友注册双方各 10 点；好友开通会员邀请人再得 30 点；邀请人每月最多奖励 30 位新注册好友。",
            ]}
          />
          <LegalSection
            title="三、V1 产品范围"
            paragraphs={[
              "V1 专注文本内容生成与运营陪跑：选题、发布包、神回复、潜力打分、复盘等。",
              "V1 不提供 AI 成片、数字人口播、视频币等能力；后续版本另行说明。",
            ]}
          />
          <LegalSection
            title="四、支付与退款"
            paragraphs={[
              "会员为虚拟服务，邀请奖励为站内虚拟权益，不含现金返利。",
              "内测期间可能使用演示支付流程，正式收款以支付宝等渠道到账为准。",
              "因系统原因导致权益未到账，请联系客服核实处理。",
            ]}
          />
        </CardContent>
      </Card>
    </LegalShell>
  );
}
