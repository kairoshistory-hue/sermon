"use client";
import Link from "next/link";
import { useState } from "react";
import { PREACHERS, findPreacher } from "@/lib/preachers";

type Item = { slug: string; title: string; series?: string; passage?: string; preacher?: string; date: string };

export default function SermonList({ sermons }: { sermons: Item[] }) {
  const [who, setWho] = useState("all");
  const list = sermons.filter((s) => who === "all" || findPreacher(s.preacher)?.id === who);
  const sel = PREACHERS.find((p) => p.id === who);
  return (
    <>
      <div className="chips">
        <button className={who === "all" ? "on" : ""} onClick={() => setWho("all")}>전체 <i>{sermons.length}</i></button>
        {PREACHERS.map((p) => (
          <button key={p.id} className={who === p.id ? "on" : ""} onClick={() => setWho(p.id)}>
            {p.name} <i>{sermons.filter((s) => findPreacher(s.preacher)?.id === p.id).length}</i>
          </button>
        ))}
      </div>
      {sel && <p className="who">{sel.church} {sel.role} · {sel.name} 목사</p>}
      {list.length === 0 && <p className="muted">아직 올라온 설교가 없습니다.</p>}
      <div className="cards">
        {list.map((s) => {
          const p = findPreacher(s.preacher);
          return (
            <Link key={s.slug} href={`/sermons/${s.slug}`} className="card">
              <span className="eyebrow">{s.series}</span>
              <strong>{s.title}</strong>
              <span className="ref">{s.passage}</span>
              <span className="muted small">{s.date} · {p ? `${p.name} 목사 (${p.church})` : s.preacher}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
