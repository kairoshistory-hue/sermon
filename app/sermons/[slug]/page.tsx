import { notFound } from "next/navigation";
import { getAllSermons, readSermon, readSummary } from "@/lib/sermons";
import { findPreacher } from "@/lib/preachers";
import SermonReader from "@/components/SermonReader";
import OfflineChip from "@/components/OfflineChip";

export function generateStaticParams() { return getAllSermons().map((s) => ({ slug: s.slug })); }

export default function SermonPage({ params }: { params: { slug: string } }) {
  let s;
  try { s = readSermon(params.slug); } catch { notFound(); }
  return (
    <article>
      <header className="hero">
        {s.series && <span className="eyebrow">{s.series}</span>}
        <h1>{s.title}</h1>
        {s.passage && <p className="ref">{s.passage}</p>}
        <p className="meta">{[findPreacher(s.preacher) ? `${findPreacher(s.preacher)!.church} ${findPreacher(s.preacher)!.role} ${findPreacher(s.preacher)!.name} 목사` : s.preacher, s.service, s.date].filter(Boolean).join(" · ")}</p>
        <OfflineChip slug={s.slug} passage={s.passage} />
        <a className="editlink" href={`/edit/${s.slug}`}>✏️ 편집</a>
        {s.youtube && <a className="yt" href={s.youtube} target="_blank" rel="noreferrer">▶ 유튜브에서 보기</a>}
      </header>
      <SermonReader content={s.content} summary={readSummary(s.slug)} passage={s.passage} title={s.title} />
    </article>
  );
}
