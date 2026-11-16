import { getAllSermons } from "@/lib/sermons";
import SermonList from "@/components/SermonList";
import OfflineAll from "@/components/OfflineAll";

export default function Home() {
  const sermons = getAllSermons().map(({ slug, title, series, passage, preacher, date }) => ({ slug, title, series, passage, preacher, date }));
  return (<><h2 className="pagehead">설교 목록</h2><a href="/search" className="searchbar link"><span>🔍</span><span className="muted">설교 찾기</span></a><OfflineAll items={sermons.map((x) => ({ slug: x.slug, passage: x.passage }))} /><SermonList sermons={sermons} /></>);
}
