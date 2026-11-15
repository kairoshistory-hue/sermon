"use client";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { summarize } from "@/lib/summarize";

export default function SermonReader({ content }: { content: string }) {
  const [show, setShow] = useState(false);
  const [size, setSize] = useState(19);
  const [progress, setProgress] = useState(0);
  const sum = useMemo(() => (show ? summarize(content) : null), [show, content]);

  useEffect(() => { const s = Number(localStorage.getItem("fs")); if (s) setSize(s); }, []);
  useEffect(() => { try { localStorage.setItem("fs", String(size)); } catch {} }, [size]);
  useEffect(() => {
    const f = () => { const h = document.documentElement; setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100); };
    window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <div className="toolbar">
        <button className={`chip ${show ? "on" : ""}`} onClick={() => setShow(!show)}>✨ 요약 {show ? "닫기" : "보기"}</button>
        <span className="spacer" />
        <button className="chip" onClick={() => setSize((s) => Math.max(15, s - 1))} aria-label="글자 작게">가−</button>
        <button className="chip" onClick={() => setSize((s) => Math.min(26, s + 1))} aria-label="글자 크게">가+</button>
      </div>

      {sum && (
        <section className="summary-card">
          <h3>핵심 문장</h3>
          <ul>{sum.top.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <h3>키워드</h3>
          <div className="tags">{sum.keywords.map((k) => <span key={k}>#{k}</span>)}</div>
          {sum.sections.length > 0 && (<>
            <h3>흐름</h3>
            <ol>{sum.sections.map((s, i) => <li key={i}><b>{s.heading}</b><br /><span>{s.line}</span></li>)}</ol>
          </>)}
          <p className="note">원고에서 중요한 문장을 자동으로 골라낸 요약입니다 (AI 아님·무료).</p>
        </section>
      )}

      <div className="body" style={{ fontSize: size }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </>
  );
}
