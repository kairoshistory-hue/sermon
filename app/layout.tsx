import "./globals.css";
import Link from "next/link";

export const metadata = { title: "설교집", description: "설교 원고 모음" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="top"><Link href="/">📖 설교집</Link><Link href="/add" className="muted">새 설교 추가</Link></header>
        <main>{children}</main>
      </body>
    </html>
  );
}
