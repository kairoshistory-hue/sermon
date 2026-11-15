import { notFound } from "next/navigation";
import { getAllSermons, readSermon, readSummary } from "@/lib/sermons";
import SermonReader from "@/components/SermonReader";

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
        <p className="meta">{[s.preacher, s.service, s.date].filter(Boolean).join(" · ")}</p>
      </header>
      <SermonReader content={s.content} summary={readSummary(s.slug)} passage={s.passage} />
    </article>
  );
}
