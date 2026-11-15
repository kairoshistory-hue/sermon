import "./globals.css";
import Link from "next/link";

export const metadata = { title: "설교집", description: "설교 원고 모음" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="nav"><Link href="/" className="logo">설교집</Link><Link href="/add">새 설교 추가</Link></nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
