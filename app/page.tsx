import Link from "next/link";
import { CHURCHES } from "@/lib/churches";
import { sermonItems } from "@/lib/sermonIndex";
import SermonList from "@/components/SermonList";
import OfflineAll from "@/components/OfflineAll";

export default function Home() {
  const all = sermonItems();
  return (
    <>
      <h2 className="pagehead">교회별 설교</h2>
      <a href="/search" className="searchbar link"><span>🔍</span><span className="muted">설교 찾기</span></a>
      <div className="folders">
        {CHURCHES.map((c) => {
          const list = all.filter((s) => s.church === c.id);
          return (
            <Link key={c.id} href={`/church/${c.id}`} className="folder">
              <span className="ficon">📁</span>
              <strong>{c.name}</strong>
              <span className="muted small">설교 {list.length}편{list[0] ? ` · 최근 ${list[0].date}` : ""}</span>
            </Link>
          );
        })}
      </div>
      <h3 className="subhead">최근 설교</h3>
      <OfflineAll items={all.map((x) => ({ slug: x.slug, passage: x.passage }))} />
      <SermonList sermons={all.slice(0, 5)} showChurch />
    </>
  );
}
