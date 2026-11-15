import Link from "next/link";
import { getAllSermons } from "@/lib/sermons";

export default function Home() {
  const sermons = getAllSermons();
  return (
    <>
      <section className="intro"><h1>설교집</h1><p>말씀을 다시 읽고 묵상합니다.</p></section>
      {sermons.length === 0 && <p className="muted">아직 설교가 없습니다.</p>}
      <div className="cards">
        {sermons.map((s) => (
          <Link key={s.slug} href={`/sermons/${s.slug}`} className="card">
            <span className="eyebrow">{s.series}</span>
            <strong>{s.title}</strong>
            <span className="muted">{s.passage}</span>
            <span className="muted small">{s.date} · {s.preacher}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
