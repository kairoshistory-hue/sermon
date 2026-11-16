import Link from "next/link";
import { churchOf } from "@/lib/churches";
import { cleanPreacher } from "@/lib/preachers";

type Item = { slug: string; title: string; series?: string; passage?: string; preacher?: string; church?: string; date: string };

export default function SermonList({ sermons, showChurch }: { sermons: Item[]; showChurch?: boolean }) {
  if (sermons.length === 0) return <p className="muted">아직 올라온 설교가 없습니다.</p>;
  return (
    <div className="cards">
      {sermons.map((s) => {
        const c = churchOf(s.preacher, s.church);
        const who = s.preacher ? `${cleanPreacher(s.preacher)} 목사` : "";
        return (
          <Link key={s.slug} href={`/sermons/${s.slug}`} className="card">
            <span className="eyebrow">{s.series}</span>
            <strong>{s.title}</strong>
            <span className="ref">{s.passage}</span>
            <span className="muted small">{[s.date, showChurch && c?.name, who].filter(Boolean).join(" · ")}</span>
          </Link>
        );
      })}
    </div>
  );
}
