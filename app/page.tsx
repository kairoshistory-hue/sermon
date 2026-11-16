import Link from "next/link";
import { CHURCHES } from "@/lib/churches";
import { sermonItems } from "@/lib/sermonIndex";
import SermonList from "@/components/SermonList";
import OfflineAll from "@/components/OfflineAll";

export default function Home() {
  const all = sermonItems();
  return (
    <>
      <section className="homehero">
        <p className="kicker">Yongin Onnuri Church</p>
        <h1>Sermon</h1>
        <p>말씀을 읽고, 듣고, 묵상합니다.</p>
      </section>
      <a href="/search" className="searchbar link"><span>🔍</span><span className="muted">설교 찾기</span></a>
      <h3 className="subhead">교회 선택</h3>
      <div className="churches">
        {CHURCHES.map((c) => {
          const list = all.filter((s) => s.church === c.id);
          return (
            <Link key={c.id} href={`/church/${c.id}`} className="church">
              <span className="logo-tile"><img src="/onnuri-logo.png" alt={c.name} /></span>
              <strong>{c.short}</strong>
              <span className="muted small">설교 {list.length}편{list[0] ? ` · 최근 ${list[0].date.slice(5).replace("-", "/")}` : ""}</span>
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
