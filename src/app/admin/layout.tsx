import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 · AI短视频运营灵感",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
