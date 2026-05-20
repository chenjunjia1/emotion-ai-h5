import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/layout/bottom-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "情绪价值助手 | EmoValue",
  description: "AI帮你生成高情商情感内容与聊天回复 · emovalue.top",
  metadataBase: new URL("https://emovalue.top"),
  openGraph: {
    title: "情绪价值助手",
    description: "AI情感运营助手 · 高情商文案与聊天回复",
    siteName: "EmoValue",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fff1f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
