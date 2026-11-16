import "./globals.css";
import Link from "next/link";
import TabBar from "@/components/TabBar";
import SwRegister from "@/components/SwRegister";
import { getAllSermons } from "@/lib/sermons";

export const metadata = {
  title: "설교집", description: "설교 원고 모음", manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "설교집", statusBarStyle: "default" as const },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#3b5ba9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const latest = getAllSermons()[0]?.slug;
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="appbar"><Link href="/">설교집</Link></header>
        <main>{children}</main>
        <TabBar latest={latest} />
        <SwRegister />
      </body>
    </html>
  );
}
