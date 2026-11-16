import { notFound } from "next/navigation";
import { getAllSermons, readSermon, readSummary } from "@/lib/sermons";
import { churchOf } from "@/lib/churches";
import { cleanPreacher } from "@/lib/preachers";
import PassageButton from "@/components/PassageButton";
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
        {s.passage && <PassageButton passage={s.passage} />}
        <p className="meta">{[churchOf(s.preacher, s.church)?.name, s.preacher ? `${cleanPreacher(s.preacher)} 목사` : "", s.service, s.date].filter(Boolean).join(" · ")}</p>
        <OfflineChip slug={s.slug} passage={s.passage} />
        {s.youtube && <a className="yt" href={s.youtube} target="_blank" rel="noreferrer">▶ 유튜브에서 보기</a>}
      </header>
      <SermonReader content={s.content} summary={readSummary(s.slug)} passage={s.passage} title={s.title} />
    </article>
  );
}
