import type { Metadata, Viewport } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.emovalue.top";

export const metadata: Metadata = {
  title: "AI短视频运营灵感",
  description:
    "不会写短视频？AI每天帮你抽选题、写标题、出脚本，生成完整发布包 · 每日更新创作灵感",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand-avatar.png", sizes: "512x512" }],
  },
  openGraph: {
    title: "AI短视频运营灵感",
    description: "抽选题 · 写标题 · 出发布包 · 情绪聊天 · 每日灵感",
    siteName: "AI短视频运营灵感",
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    images: [
      {
        url: "/og-share.png",
        width: 1200,
        height: 630,
        alt: "AI短视频运营灵感",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI短视频运营灵感",
    description: "抽选题 · 写标题 · 出发布包 · 每日灵感",
    images: ["/og-share.png"],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "AI短视频运营灵感",
    // 微信 H5 分享读取 og 标签；业务域名需 MP_verify_*.txt 放 public/
    "format-detection": "telephone=no",
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
