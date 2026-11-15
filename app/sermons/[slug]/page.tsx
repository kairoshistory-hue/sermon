import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAllSermons, readSermon } from "@/lib/sermons";
import SummaryButton from "@/components/SummaryButton";

export function generateStaticParams() {
  return getAllSermons().map((s) => ({ slug: s.slug }));
}

export default function SermonPage({ params }: { params: { slug: string } }) {
  let s;
  try { s = readSermon(params.slug); } catch { notFound(); }
  return (
    <article>
      <p className="muted small">{s.series}</p>
      <h1>{s.title}</h1>
      <p className="muted">{[s.passage, s.preacher, s.service, s.date].filter(Boolean).join(" · ")}</p>
      {s.youtube && <p><a href={s.youtube} target="_blank" rel="noreferrer">▶ YouTube에서 듣기</a></p>}
      <SummaryButton slug={s.slug} />
      <div className="body"><ReactMarkdown>{s.content}</ReactMarkdown></div>
    </article>
  );
}
