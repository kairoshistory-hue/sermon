"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { findPreacher } from "@/lib/preachers";

type Item = { slug: string; title: string; series?: string; passage?: string; preacher?: string; date: string; text: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Mark({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.map(esc).join("|")})`, "gi"));
  return <>{parts.map((p, i) => (words.some((w) => w.toLowerCase() === p.toLowerCase()) ? <mark key={i}>{p}</mark> : p))}</>;
}

export default function SearchBox({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("q"); if (p) setQ(p);
    ref.current?.focus();
  }, []);
  useEffect(() => { const u = new URL(location.href); q ? u.searchParams.set("q", q) : u.searchParams.delete("q"); history.replaceState(null, "", u); }, [q]);

  const words = useMemo(() => q.trim().split(/\s+/).filter((w) => w.length > 0), [q]);
  const results = useMemo(() => {
    if (!words.length) return [];
    return items.map((it) => {
      const head = [it.title, it.series, it.passage, it.preacher].join(" ").toLowerCase();
      const body = it.text.toLowerCase();
      if (!words.every((w) => head.includes(w.toLowerCase()) || body.includes(w.toLowerCase()))) return null;
      let hits = 0; for (const w of words) hits += body.split(w.toLowerCase()).length - 1 + (head.includes(w.toLowerCase()) ? 20 : 0);
      const at = Math.max(0, body.indexOf(words[0].toLowerCase()));
      const snip = at >= 0 && body.includes(words[0].toLowerCase()) ? (at > 40 ? "…" : "") + it.text.slice(Math.max(0, at - 40), at + 110) + "…" : it.text.slice(0, 120) + "…";
      return { it, hits, snip };
    }).filter(Boolean).sort((a, b) => b!.hits - a!.hits) as { it: Item; hits: number; snip: string }[];
  }, [items, words]);

  return (
    <>
      <div className="searchbar">
        <span>🔍</span>
        <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목, 성경, 설교자, 본문 단어 (예: 서원, 입다)" />
        {q && <button onClick={() => setQ("")} aria-label="지우기">✕</button>}
      </div>
      {words.length > 0 && <p className="small muted">{results.length}편 찾음</p>}
      <div className="cards">
        {results.map(({ it, snip }) => {
          const p = findPreacher(it.preacher);
          return (
            <Link key={it.slug} href={`/sermons/${it.slug}`} className="card">
              <span className="eyebrow">{it.series}</span>
              <strong><Mark text={it.title} words={words} /></strong>
              <span className="ref">{it.passage}</span>
              <span className="snip"><Mark text={snip} words={words} /></span>
              <span className="muted small">{it.date} · {p ? `${p.name} 목사` : it.preacher}</span>
            </Link>
          );
        })}
      </div>
      {!words.length && <p className="muted small">설교 제목, 본문 구절(예: 사사기 11), 설교자 이름, 설교 속 단어로 찾을 수 있습니다. 여러 단어를 띄어 쓰면 모두 들어 있는 설교만 보여 줍니다.</p>}
    </>
  );
}
