import { LegalSection } from "@/components/legal-section";
import { LegalShell } from "@/components/layout/legal-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_CONTACT } from "@/lib/content/legal";

export default function PrivacyPolicyPage() {
  return (
    <LegalShell title="隐私政策">
      <Card>
        <CardContent>
          <LegalSection
            title="一、我们收集的信息"
            paragraphs={[
              "手机号：用于登录与账号识别。",
              "设备与日志信息：用于安全风控、问题排查。",
              "订单与生成记录：用于权益发放、历史查询与客服处理。",
            ]}
          />
          <LegalSection
            title="二、信息用途"
            paragraphs={[
              "提供登录、内容生成、订单支付与会员权益服务。",
              "进行内容风控、防刷与系统安全保护。",
              "客服跟进与产品改进（在合法合规前提下）。",
            ]}
          />
          <LegalSection
            title="三、存储与保护"
            paragraphs={[
              "我们采取合理技术措施保护您的个人信息安全。",
              "除法律法规要求或经您同意外，不向无关第三方出售您的个人信息。",
            ]}
          />
          <LegalSection
            title="四、第三方服务"
            paragraphs={[
              "产品可能接入短信、支付、AI 接口等第三方服务，实际以页面公示及上线配置为准。",
              "第三方将按其隐私政策处理相关数据。",
            ]}
          />
          <LegalSection
            title="五、您的权利"
            paragraphs={[
              "您可申请查询、更正或删除相关个人信息，也可申请注销账号（请联系客服）。",
              `隐私问题联系：${SUPPORT_CONTACT.email}（客服微信：${SUPPORT_CONTACT.wechat}）`,
            ]}
          />
        </CardContent>
      </Card>
    </LegalShell>
  );
}
