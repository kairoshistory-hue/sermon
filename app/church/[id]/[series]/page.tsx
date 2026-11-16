import Link from "next/link";
import { notFound } from "next/navigation";
import { CHURCHES } from "@/lib/churches";
import { sermonItems } from "@/lib/sermonIndex";
import { fromSlug, seriesName, seriesSlug } from "@/lib/series";
import SermonList from "@/components/SermonList";

export function generateStaticParams() {
  const out: { id: string; series: string }[] = [];
  for (const c of CHURCHES) {
    const names = new Set(sermonItems().filter((s) => s.church === c.id).map((s) => seriesName(s.series)).filter(Boolean));
    names.forEach((n) => out.push({ id: c.id, series: seriesSlug(n) }));
  }
  return out;
}

export default function SeriesPage({ params }: { params: { id: string; series: string } }) {
  const church = CHURCHES.find((c) => c.id === params.id);
  const name = fromSlug(params.series);
  if (!church) notFound();
  const list = sermonItems().filter((s) => s.church === church.id && seriesName(s.series) === name).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (list.length === 0) notFound();
  return (
    <>
      <Link href={`/church/${church.id}`} className="back">← {church.name}</Link>
      <h2 className="pagehead">📂 {name} <span className="muted small">{list.length}편 · 1회부터</span></h2>
      <Link href={`/church/${church.id}/${params.series}/book`} className="bookbtn"><span>📖</span><span><b>책으로 보기</b><small>목차와 페이지로 {list.length}편을 이어서 읽습니다</small></span></Link>
      <SermonList sermons={list} />
    </>
  );
}
