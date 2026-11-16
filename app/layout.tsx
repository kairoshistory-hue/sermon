import "./globals.css";
import Link from "next/link";
import TabBar from "@/components/TabBar";
import SwRegister from "@/components/SwRegister";
import { getAllSermons } from "@/lib/sermons";

export const metadata = {
  title: "Yongin Onnuri Church Sermon", description: "용인온누리교회 · 온누리교회 설교 원고", manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Onnuri Sermon", statusBarStyle: "default" as const },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#3b5ba9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const latest = getAllSermons()[0]?.slug;
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <header className="appbar"><Link href="/">Yongin Onnuri Church Sermon</Link></header>
        <main>{children}</main>
        <TabBar latest={latest} />
        <SwRegister />
      </body>
    </html>
  );
}
