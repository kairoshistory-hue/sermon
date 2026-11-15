import Link from "next/link";
import { getAllSermons } from "@/lib/sermons";

export default function Home() {
  const sermons = getAllSermons();
  return (
    <>
      <h1>설교 목록</h1>
      {sermons.length === 0 && <p className="muted">아직 설교가 없습니다.</p>}
      <ul className="list">
        {sermons.map((s) => (
          <li key={s.slug}>
            <Link href={`/sermons/${s.slug}`}>
              <strong>{s.title}</strong>
              <span className="muted">{[s.series, s.passage].filter(Boolean).join(" · ")}</span>
              <span className="muted small">{s.date} · {s.preacher}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
