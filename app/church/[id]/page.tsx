import Link from "next/link";
import { notFound } from "next/navigation";
import { CHURCHES } from "@/lib/churches";
import { sermonItems } from "@/lib/sermonIndex";
import { seriesName, seriesSlug } from "@/lib/series";
import SermonList from "@/components/SermonList";
import SeriesFolder from "@/components/SeriesFolder";

export function generateStaticParams() { return CHURCHES.map((c) => ({ id: c.id })); }

export default function ChurchPage({ params }: { params: { id: string } }) {
  const church = CHURCHES.find((c) => c.id === params.id);
  if (!church) notFound();
  const list = sermonItems().filter((s) => s.church === church.id);
  const groups = new Map<string, typeof list>();
  const loose: typeof list = [];
  for (const s of list) {
    const n = seriesName(s.series);
    if (!n) { loose.push(s); continue; }
    groups.set(n, [...(groups.get(n) ?? []), s]);
  }
  const folders = Array.from(groups.entries()).sort((a, b) => (a[1][0].date < b[1][0].date ? 1 : -1));
  return (
    <>
      <Link href="/" className="back">← 교회 선택</Link>
      <div className="churchhead"><span className="logo-tile sm"><img src="/onnuri-logo.png" alt="" /></span></div>
      <h2 className="pagehead">{church.name} <span className="muted small">{list.length}편</span></h2>
      {list[0] && (<><h3 className="subhead">가장 최근 설교</h3><SermonList sermons={list.slice(0, 1)} /></>)}
      <h3 className="subhead">시리즈</h3>
      {folders.length === 0 && <p className="muted">아직 시리즈가 없습니다.</p>}
      <div className="sfolders">
        {folders.map(([name, items]) => (
          <SeriesFolder key={name} href={`/church/${church.id}/${seriesSlug(name)}`} name={name} count={items.length} latest={items[0].date} />
        ))}
      </div>
      {loose.length > 0 && (<><h3 className="subhead">기타 설교</h3><SermonList sermons={loose} /></>)}
    </>
  );
}
