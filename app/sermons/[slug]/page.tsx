import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSermons, readSermon } from "@/lib/sermons";
import SermonReader from "@/components/SermonReader";

export function generateStaticParams() { return getAllSermons().map((s) => ({ slug: s.slug })); }

export default function SermonPage({ params }: { params: { slug: string } }) {
  let s;
  try { s = readSermon(params.slug); } catch { notFound(); }
  return (
    <article>
      <Link href="/" className="back">← 목록</Link>
      <header className="hero">
        {s.series && <span className="eyebrow">{s.series}</span>}
        <h1>{s.title}</h1>
        <p className="meta">{[s.passage, s.preacher, s.service].filter(Boolean).join(" · ")}<br />{s.date}</p>
        {s.youtube && <a className="yt" href={s.youtube} target="_blank" rel="noreferrer">▶ 영상으로 보기</a>}
      </header>
      <SermonReader content={s.content} />
    </article>
  );
}
