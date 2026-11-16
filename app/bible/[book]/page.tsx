import Link from "next/link";
import { notFound } from "next/navigation";
import { BOOKS } from "@/lib/bible";
import { sermonItems } from "@/lib/sermonIndex";
import SermonList from "@/components/SermonList";

export function generateStaticParams() {
  return Array.from(new Set(sermonItems().map((s) => s.book).filter(Boolean))).map((b) => ({ book: String(b) }));
}

export default function BookPage({ params }: { params: { book: string } }) {
  const code = Number(params.book);
  if (!(code >= 1 && code <= 66)) notFound();
  const chapter = (p?: string) => Number(p?.match(/(\d+)\s*:/)?.[1] ?? 999);
  const list = sermonItems().filter((s) => s.book === code).sort((a, b) => chapter(a.passage) - chapter(b.passage) || (a.date < b.date ? -1 : 1));
  return (
    <>
      <Link href="/bible" className="back">← 성경 66권</Link>
      <h2 className="pagehead">{BOOKS[code - 1]} <span className="muted small">{list.length}편 · 장 순서</span></h2>
      <SermonList sermons={list} showChurch />
    </>
  );
}
