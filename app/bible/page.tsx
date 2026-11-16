import Link from "next/link";
import { BOOKS, ABBR, OT_COUNT } from "@/lib/bible";
import { sermonItems } from "@/lib/sermonIndex";

export const metadata = { title: "성경별 설교 · 설교집" };

export default function BiblePage() {
  const counts = new Map<number, number>();
  for (const s of sermonItems()) if (s.book) counts.set(s.book, (counts.get(s.book) ?? 0) + 1);
  const grid = (from: number, to: number) => (
    <div className="books">
      {BOOKS.slice(from, to).map((name, i) => {
        const code = from + i + 1, n = counts.get(code) ?? 0;
        const inner = (<><b>{ABBR[code - 1]}</b><span>{name}</span>{n > 0 && <i>{n}</i>}</>);
        return n > 0
          ? <Link key={code} href={`/bible/${code}`} className="book has">{inner}</Link>
          : <div key={code} className="book">{inner}</div>;
      })}
    </div>
  );
  return (
    <>
      <h2 className="pagehead">성경별 설교</h2>
      <p className="muted small">색이 있는 책을 누르면 그 책의 설교를 볼 수 있습니다. 숫자는 설교 수입니다.</p>
      <h3 className="testament">구약</h3>{grid(0, OT_COUNT)}
      <h3 className="testament">신약</h3>{grid(OT_COUNT, 66)}
    </>
  );
}
