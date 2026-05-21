import { LegalSection } from "@/components/legal-section";
import { LegalShell } from "@/components/layout/legal-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function RightsAgreementPage() {
  return (
    <LegalShell title="会员与视频币规则">
      <Card>
        <CardContent>
          <LegalSection
            title="一、会员套餐"
            paragraphs={[
              "免费版：每日 3 次文案额度。",
              "Pro 会员（¥39/30天）：每日 40 次文案额度，完整今日视频与爆款同款。",
              "高级会员（¥99/30天）：每日 120 次额度，完整账号方案，赠 20 视频币。",
              "工作室版（¥299/30天）：每日 500 次额度，赠 80 视频币。",
            ]}
          />
          <LegalSection
            title="二、文案额度"
            paragraphs={[
              "账号方案消耗 5 次，今日视频与爆款同款各消耗 3 次。",
              "生成成功才扣减额度，生成失败不扣减。",
              "额度每日重置，奖励额度可额外使用。",
            ]}
          />
          <LegalSection
            title="三、视频币"
            paragraphs={[
              "数字人口播：25 视频币/次；AI 自动成片：59 视频币/次。",
              "创建任务时冻结视频币，任务成功扣除，任务失败自动退回冻结部分。",
              "已正式消耗的视频币不支持无理由退回。",
            ]}
          />
          <LegalSection
            title="四、支付与退款"
            paragraphs={[
              "会员与视频币为虚拟服务/虚拟权益。",
              "因系统原因导致权益未到账，请联系客服核实处理。",
              "V1 当前为 Mock 支付，仅用于演示流程。",
            ]}
          />
        </CardContent>
      </Card>
    </LegalShell>
  );
}
