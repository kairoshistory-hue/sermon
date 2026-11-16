"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export type Chap = { slug: string; title: string; passage?: string; date: string; preacher?: string; part?: number; content: string; summary?: string };

const PAD = 22; // 좌우 여백(px)

export default function BookReader({ title, church, chapters, backHref }: { title: string; church: string; chapters: Chap[]; backHref: string }) {
  const key = `book:${church}:${title}`;
  const viewRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const chapRefs = useRef<(HTMLElement | null)[]>([]);
  const [w, setW] = useState(0);
  const [fs, setFs] = useState(17);
  const [withSum, setWithSum] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(1);
  const [starts, setStarts] = useState<number[]>([]);
  const ratio = useRef(0);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) || "{}");
      if (s.fs) setFs(s.fs);
      if (s.sum) setWithSum(true);
      if (typeof s.r === "number") ratio.current = s.r;
    } catch {}
  }, [key]);

  // 화면 폭 측정
  useLayoutEffect(() => {
    const v = viewRef.current; if (!v) return;
    const update = () => setW(v.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(v);
    return () => ro.disconnect();
  }, []);

  const measure = useCallback(() => {
    const v = viewRef.current, f = flowRef.current;
    if (!v || !f || !v.clientWidth) return;
    const W = v.clientWidth;
    const n = Math.max(1, Math.round((f.scrollWidth + 2 * PAD) / W));
    setTotal(n);
    setStarts(chapRefs.current.map((el) => (el ? Math.min(n - 1, Math.floor((el.offsetLeft + 4) / W)) : 0)));
    setPage((p) => Math.min(n - 1, ratio.current > 0 && p === 0 ? Math.round(ratio.current * (n - 1)) : p));
  }, []);

  useEffect(() => {
    if (!w) return;
    let a = 0, b = 0;
    const run = () => { a = requestAnimationFrame(() => { b = requestAnimationFrame(measure); }); };
    run();
    (document as any).fonts?.ready?.then(run);
    return () => { cancelAnimationFrame(a); cancelAnimationFrame(b); };
  }, [w, fs, withSum, measure, chapters]);

  useEffect(() => {
    if (total > 1) { ratio.current = page / (total - 1); }
    try { localStorage.setItem(key, JSON.stringify({ fs, sum: withSum, r: ratio.current })); } catch {}
  }, [page, total, fs, withSum, key]);

  const go = useCallback((p: number) => setPage(Math.max(0, Math.min(total - 1, p))), [total]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(page + 1); if (e.key === "ArrowLeft") go(page - 1); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [go, page]);

  const tx = useRef(0);
  const cur = starts.length ? starts.reduce((acc, s, i) => (s <= page ? i : acc), -1) : -1;

  return (
    <div className="bookroot">
      <header className="bk-head">
        <Link href={backHref} aria-label="닫기">✕</Link>
        <strong>{title}</strong>
        <span className="bk-tools">
          <button onClick={() => setFs((s) => Math.max(14, s - 1))} aria-label="글자 작게">가−</button>
          <button onClick={() => setFs((s) => Math.min(26, s + 1))} aria-label="글자 크게">가+</button>
          <button className={withSum ? "on" : ""} onClick={() => setWithSum((v) => !v)}>요약</button>
          <button onClick={() => window.print()} aria-label="PDF로 저장">PDF</button>
        </span>
      </header>

      <div
        className="bk-view" ref={viewRef}
        onTouchStart={(e) => { tx.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - tx.current; if (Math.abs(dx) > 50) go(page + (dx < 0 ? 1 : -1)); }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button,a")) return;
          if (window.getSelection()?.toString()) return;
          const r = e.currentTarget.getBoundingClientRect(); const x = e.clientX - r.left;
          if (x < r.width * 0.28) go(page - 1); else if (x > r.width * 0.72) go(page + 1);
        }}
      >
        <div
          className="bookflow" ref={flowRef}
          style={{ fontSize: fs, columnWidth: Math.max(120, w - 2 * PAD), columnGap: 2 * PAD, width: Math.max(120, w - 2 * PAD), transform: `translateX(${-page * w}px)` }}
        >
          <section className="cover" ref={(el) => { chapRefs.current[0] = el; }}>
            <span className="logo-tile"><img src="/onnuri-logo.png" alt="" /></span>
            <p className="kicker">{church}</p>
            <h1>{title}</h1>
            <p className="cmeta">{chapters.length}편의 설교<br />{chapters[0]?.date.replace(/-/g, ".")} – {chapters[chapters.length - 1]?.date.replace(/-/g, ".")}</p>
            <p className="chint">좌우로 넘기거나 화면 양끝을 눌러 페이지를 넘깁니다.</p>
          </section>

          <section className="toc" ref={(el) => { chapRefs.current[1] = el; }}>
            <h2>목차</h2>
            <ol>
              {chapters.map((c, i) => (
                <li key={c.slug}>
                  <button onClick={() => go(starts[i + 2] ?? 0)}>
                    <span className="tt"><b>{c.part ? `${c.part}회` : `${i + 1}`}</b> {c.title}<small>{c.passage}</small></span>
                    <span className="dots" />
                    <span className="pn">{starts[i + 2] != null ? starts[i + 2] + 1 : ""}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          {chapters.map((c, i) => (
            <article key={c.slug} className="chap" ref={(el) => { chapRefs.current[i + 2] = el; }}>
              <p className="cn">{c.part ? `${c.part}회` : `제 ${i + 1} 편`}</p>
              <h2>{c.title}</h2>
              <p className="cref">{[c.passage, c.date.replace(/-/g, "."), c.preacher].filter(Boolean).join(" · ")}</p>
              <ReactMarkdown>{c.content}</ReactMarkdown>
              {withSum && c.summary && <div className="csum"><h3>요약</h3><ReactMarkdown>{c.summary}</ReactMarkdown></div>}
            </article>
          ))}
        </div>
      </div>

      <footer className="bk-foot">
        <button onClick={() => go(page - 1)} disabled={page === 0} aria-label="이전 페이지">‹</button>
        <div className="bk-mid">
          <input type="range" min={1} max={total} value={page + 1} onChange={(e) => go(Number(e.target.value) - 1)} aria-label="페이지 이동" />
          <span>{page + 1} / {total}{cur >= 2 ? ` · ${chapters[cur - 2].title}` : cur === 1 ? " · 목차" : ""}</span>
        </div>
        <button onClick={() => go(page + 1)} disabled={page >= total - 1} aria-label="다음 페이지">›</button>
      </footer>
    </div>
  );
}
