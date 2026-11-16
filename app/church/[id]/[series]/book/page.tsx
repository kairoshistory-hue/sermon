import { notFound } from "next/navigation";
import { CHURCHES } from "@/lib/churches";
import { getAllSermons, readSummary } from "@/lib/sermons";
import { fromSlug, seriesName, seriesSlug } from "@/lib/series";
import { cleanPreacher } from "@/lib/preachers";
import BookReader from "@/components/BookReader";

export function generateStaticParams() {
  const out: { id: string; series: string }[] = [];
  for (const c of CHURCHES) {
    const names = new Set(getAllSermons().filter((s) => s.church === c.id).map((s) => seriesName(s.series)).filter(Boolean));
    names.forEach((n) => out.push({ id: c.id, series: seriesSlug(n) }));
  }
  return out;
}

export default function BookPage({ params }: { params: { id: string; series: string } }) {
  const church = CHURCHES.find((c) => c.id === params.id);
  const name = fromSlug(params.series);
  if (!church) notFound();
  const list = getAllSermons().filter((s) => s.church === church.id && seriesName(s.series) === name).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (list.length === 0) notFound();
  const chapters = list.map((s) => ({
    slug: s.slug, title: s.title, passage: s.passage, date: s.date,
    preacher: s.preacher ? `${cleanPreacher(s.preacher)} 목사` : undefined,
    part: Number(s.series?.match(/\((\d+)\)\s*$/)?.[1]) || undefined,
    content: s.content, summary: readSummary(s.slug),
  }));
  return <BookReader title={name} church={church.name} chapters={chapters} backHref={`/church/${church.id}/${seriesSlug(name)}`} />;
}
