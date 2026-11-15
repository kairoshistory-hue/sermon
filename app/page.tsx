import { getAllSermons } from "@/lib/sermons";
import SermonList from "@/components/SermonList";

export default function Home() {
  const sermons = getAllSermons().map(({ slug, title, series, passage, preacher, date }) => ({ slug, title, series, passage, preacher, date }));
  return (<><h2 className="pagehead">설교 목록</h2><SermonList sermons={sermons} /></>);
}
