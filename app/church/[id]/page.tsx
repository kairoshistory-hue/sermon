import Link from "next/link";
import { notFound } from "next/navigation";
import { CHURCHES } from "@/lib/churches";
import { sermonItems } from "@/lib/sermonIndex";
import SermonList from "@/components/SermonList";

export function generateStaticParams() { return CHURCHES.map((c) => ({ id: c.id })); }

export default function ChurchPage({ params }: { params: { id: string } }) {
  const church = CHURCHES.find((c) => c.id === params.id);
  if (!church) notFound();
  const list = sermonItems().filter((s) => s.church === church.id);
  return (
    <>
      <Link href="/" className="back">← 교회 목록</Link>
      <h2 className="pagehead">📁 {church.name} <span className="muted small">{list.length}편</span></h2>
      <SermonList sermons={list} />
    </>
  );
}
