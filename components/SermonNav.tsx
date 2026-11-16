import Link from "next/link";

type S = { slug: string; title: string; series?: string } | undefined;

export default function SermonNav({ prev, next, compact }: { prev: S; next: S; compact?: boolean }) {
  if (!prev && !next) return null;
  if (compact)
    return (
      <div className="navchips">
        {prev ? <Link href={`/sermons/${prev.slug}`}>‹ 전편</Link> : <span className="off">‹ 전편</span>}
        {next ? <Link href={`/sermons/${next.slug}`}>다음 편 ›</Link> : <span className="off">다음 편 ›</span>}
      </div>
    );
  return (
    <nav className="sernav">
      {prev ? (
        <Link href={`/sermons/${prev.slug}`} className="prev">
          <span className="dir">← 전편 설교 읽기</span>
          <strong>{prev.title}</strong>
          <span className="muted small">{prev.series}</span>
        </Link>
      ) : <span className="prev off" />}
      {next ? (
        <Link href={`/sermons/${next.slug}`} className="next">
          <span className="dir">다음 편 설교 읽기 →</span>
          <strong>{next.title}</strong>
          <span className="muted small">{next.series}</span>
        </Link>
      ) : <span className="next off" />}
    </nav>
  );
}
