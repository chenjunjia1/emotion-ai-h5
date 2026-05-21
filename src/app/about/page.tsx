import Link from "next/link";
import { APP_VERSION } from "@/lib/content/legal";
import { LegalShell } from "@/components/layout/legal-shell";
import { Card, CardContent } from "@/components/ui/card";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { href: "/agreement/user", label: "用户协议" },
  { href: "/agreement/privacy", label: "隐私政策" },
  { href: "/agreement/rights", label: "会员与视频币规则" },
];

export default function AboutPage() {
  return (
    <LegalShell title="关于我们">
      <Card className="bg-gradient-to-br from-orange-50 to-rose-50">
        <CardContent>
          <h2 className="text-lg font-bold text-slate-900">AI短视频运营助手</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            帮助小白博主与运营者完成账号定位、每日选题、视频脚本、爆款同款与 AI 成片准备的一站式
            H5 工具。
          </p>
          <p className="mt-3 text-xs text-orange-600">当前版本：{APP_VERSION}</p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-600">联系邮箱：support@example.com</p>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block rounded-2xl border px-4 py-3 text-sm font-bold text-orange-700",
                theme.border,
                theme.softOrange
              )}
            >
              {l.label} →
            </Link>
          ))}
        </CardContent>
      </Card>
    </LegalShell>
  );
}
