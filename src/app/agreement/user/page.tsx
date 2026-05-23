import { LegalSection } from "@/components/legal-section";
import { LegalShell } from "@/components/layout/legal-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function UserAgreementPage() {
  return (
    <LegalShell title="用户协议">
      <Card>
        <CardContent className="prose-sm">
          <LegalSection
            title="一、服务说明"
            paragraphs={[
              "AI短视频运营陪跑助手（以下简称「本产品」）为用户提供选题盲盒、完整发布包、标题扭蛋、账号方向测试、神回复与运营复盘等文本内容辅助服务。",
              "本产品输出内容为 AI 辅助生成，不构成专业投资、医疗、法律意见。",
            ]}
          />
          <LegalSection
            title="二、账号使用"
            paragraphs={[
              "用户应使用本人手机号注册登录，妥善保管账号信息。",
              "禁止利用本产品从事违法违规、侵权、虚假宣传等行为。",
            ]}
          />
          <LegalSection
            title="三、AI 生成内容"
            paragraphs={[
              "用户对使用 AI 生成内容后的发布、传播行为自行负责。",
              "发布前请自行核对真实性、合规性及平台规则。",
            ]}
          />
          <LegalSection
            title="四、会员与灵感"
            paragraphs={[
              "会员订阅与灵感为虚拟权益，具体规则见《会员与灵感规则》。",
              "V1 不提供 AI 成片、数字人、视频币；权益发放以订单支付成功且系统校验通过为准。",
            ]}
          />
          <LegalSection
            title="五、免责声明"
            paragraphs={[
              "因不可抗力、第三方服务中断等导致的服务不可用，本平台将尽力恢复但不承担间接损失。",
              "用户违反法律法规或本协议造成的损失由用户自行承担。",
            ]}
          />
        </CardContent>
      </Card>
    </LegalShell>
  );
}
