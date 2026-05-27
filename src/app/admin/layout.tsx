import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 · AI灵感创作",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
