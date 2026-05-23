import type { Metadata, Viewport } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://emovalue.top";

export const metadata: Metadata = {
  title: "AI短视频运营陪跑助手",
  description:
    "不会写短视频？AI每天帮你抽选题、写标题、出脚本，生成完整发布包 · 轻松陪跑做账号",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "AI短视频运营陪跑助手",
    description: "抽选题 · 发布包 · 情绪聊天 · 运营陪跑",
    siteName: "AI短视频运营",
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    images: [{ url: "/og-share.png", width: 1200, height: 630, alt: "AI短视频运营" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "AI短视频运营",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF7F0",
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
      <body className="bg-[#FFF7F0] text-slate-800 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
