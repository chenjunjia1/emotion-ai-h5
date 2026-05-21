import type { Metadata, Viewport } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI短视频运营助手",
  description:
    "AI帮你生成账号方案、每日视频脚本、爆款同款与AI成片 · 小红书高级奶油风",
  metadataBase: new URL("https://emovalue.top"),
  openGraph: {
    title: "AI短视频运营助手",
    description: "起号 · 创作 · 爆款同款 · AI成片",
    siteName: "AI Short Video Operating Assistant",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fff7ed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="bg-gradient-to-br from-white via-orange-50 to-rose-50 text-slate-950 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
