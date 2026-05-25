import type { Metadata, Viewport } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.emovalue.top";

const SHARE_IMAGE = "/wechat-share.jpg";

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
    // 微信链接分享：JPG 无透明底、<32KB（PNG 透明区会变黑块）
    images: [
      {
        url: SHARE_IMAGE,
        width: 300,
        height: 300,
        alt: "AI短视频运营灵感",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI短视频运营灵感",
    description: "抽选题 · 写标题 · 出发布包 · 每日灵感",
    images: [SHARE_IMAGE],
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
        <link rel="image_src" href={`${SITE_URL}${SHARE_IMAGE}`} />
        <meta itemProp="name" content="AI短视频运营灵感" />
        <meta itemProp="image" content={`${SITE_URL}${SHARE_IMAGE}`} />
        <meta itemProp="description" content="抽选题 · 写标题 · 出发布包 · 情绪聊天 · 每日灵感" />
      </head>
      <body className="bg-[#FFF7F0] text-slate-800 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
