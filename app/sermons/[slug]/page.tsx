import { notFound } from "next/navigation";
import { getAllSermons, readSermon, readSummary } from "@/lib/sermons";
import { churchOf } from "@/lib/churches";
import { cleanPreacher } from "@/lib/preachers";
import { seriesName, seriesSlug } from "@/lib/series";
import Link from "next/link";
import SermonNav from "@/components/SermonNav";
import PassageButton from "@/components/PassageButton";
import SermonReader from "@/components/SermonReader";
import OfflineChip from "@/components/OfflineChip";

export function generateStaticParams() { return getAllSermons().map((s) => ({ slug: s.slug })); }

export default function SermonPage({ params }: { params: { slug: string } }) {
  let s;
  try { s = readSermon(params.slug); } catch { notFound(); }
  const mine = getAllSermons().filter((x) => x.church === s.church && seriesName(x.series) === seriesName(s.series)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const i = mine.findIndex((x) => x.slug === s.slug);
  const prev = i > 0 ? mine[i - 1] : undefined;
  const next = i >= 0 && i < mine.length - 1 ? mine[i + 1] : undefined;
  return (
    <article className="paper">
      <header className="hero">
        {s.series && (s.church && seriesName(s.series) ? <Link href={`/church/${s.church}/${seriesSlug(seriesName(s.series))}`} className="eyebrow">📂 {s.series}</Link> : <span className="eyebrow">{s.series}</span>)}
        <h1>{s.title}</h1>
        {s.passage && <PassageButton passage={s.passage} />}
        <p className="meta">{[churchOf(s.preacher, s.church)?.name, s.preacher ? `${cleanPreacher(s.preacher)} 목사` : "", s.service, s.date].filter(Boolean).join(" · ")}</p>
        <OfflineChip slug={s.slug} passage={s.passage} />
        <SermonNav prev={prev} next={next} compact />
        {s.youtube && <a className="yt" href={s.youtube} target="_blank" rel="noreferrer">▶ 유튜브에서 보기</a>}
      </header>
      <SermonReader content={s.content} summary={readSummary(s.slug)} passage={s.passage} title={s.title} />
      <SermonNav prev={prev} next={next} />
    </article>
  );
}
