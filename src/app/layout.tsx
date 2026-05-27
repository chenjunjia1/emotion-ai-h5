import type { Metadata, Viewport } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.emovalue.top";

const SHARE_IMAGE = "/wechat-share.jpg";

export const metadata: Metadata = {
  title: "AI灵感创作",
  description:
    "发朋友圈、写小红书、做短视频、回消息 — AI帮你表达得更自然、更高级、更容易获得互动",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand-avatar.png", sizes: "512x512" }],
  },
  openGraph: {
    title: "AI灵感创作",
    description: "发朋友圈 · 写小红书 · 做短视频 · 回消息 · AI灵感创作",
    siteName: "AI灵感创作",
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    // 微信链接分享：JPG 无透明底、<32KB（PNG 透明区会变黑块）
    images: [
      {
        url: SHARE_IMAGE,
        width: 300,
        height: 300,
        alt: "AI灵感创作",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI灵感创作",
    description: "发朋友圈 · 写小红书 · 做短视频 · 回消息",
    images: [SHARE_IMAGE],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "AI灵感创作",
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
        <meta itemProp="name" content="AI灵感创作" />
        <meta itemProp="image" content={`${SITE_URL}${SHARE_IMAGE}`} />
        <meta itemProp="description" content="抽选题 · 写标题 · 出发布包 · 情绪聊天 · 每日灵感" />
      </head>
      <body className="bg-[#FFF5F0] text-slate-800 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
