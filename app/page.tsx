import Link from "next/link";
import { getAllSermons } from "@/lib/sermons";

export default function Home() {
  const sermons = getAllSermons();
  return (
    <>
      <h2 className="pagehead">설교 목록</h2>
      {sermons.length === 0 && <p className="muted">아직 설교가 없습니다.</p>}
      <div className="cards">
        {sermons.map((s) => (
          <Link key={s.slug} href={`/sermons/${s.slug}`} className="card">
            <span className="eyebrow">{s.series}</span>
            <strong>{s.title}</strong>
            <span className="ref">{s.passage}</span>
            <span className="muted small">{s.date} · {s.preacher}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
