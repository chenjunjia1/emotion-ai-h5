import { RouteLoading } from "@/components/ui/route-loading";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7F0] via-[#FFF0F5] to-[#FFF7F0]">
      <RouteLoading label="正在打开创建页…" />
    </div>
  );
}
