"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar({ latest }: { latest?: string }) {
  const p = usePathname();
  if (p.startsWith("/sermons")) return null; // 설교 페이지는 자체 하단 메뉴 사용
  const tabs = [
    { href: "/", icon: "📚", label: "설교", on: p === "/" },
    ...(latest ? [{ href: `/sermons/${latest}`, icon: "📖", label: "최신", on: p.startsWith("/sermons") }] : []),
    { href: "/add", icon: "➕", label: "추가", on: p === "/add" },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={t.on ? "on" : ""}><span>{t.icon}</span>{t.label}</Link>
      ))}
    </nav>
  );
}
