"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { summarize } from "@/lib/summarize";
import BiblePanel from "./BiblePanel";
import Sheet from "./Sheet";
import { copyText, mdToPlain, shareText, TOAST } from "@/lib/share";

const RATES = [0.7, 0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];

const plain = (b: string) =>
  b.split("\n").map((l) => l.replace(/^#+\s*/, "").replace(/^>\s?/, "").replace(/[*_`]/g, "")).join(" ").replace(/\s+/g, " ").trim();

function chunk(text: string, max = 130): string[] {
  const out: string[] = []; let cur = "";
  for (const s of text.split(/(?<=[.?!”"])\s+/)) {
    if ((cur + " " + s).trim().length > max && cur) { out.push(cur); cur = s; } else cur = (cur + " " + s).trim();
  }
  if (cur) out.push(cur);
  return out.flatMap((c) => (c.length > 220 ? c.match(/.{1,200}(\s|$)/g)!.map((x) => x.trim()) : [c]));
}

export default function SermonReader({ content, summary, passage, title }: { content: string; summary?: string; passage?: string; title?: string }) {
  const [sheet, setSheet] = useState<"" | "sum" | "bible">("");
  const [size, setSize] = useState(19);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const footer = () => `\n\n— ${title ?? "설교"}${passage ? ` (${passage})` : ""}\n${location.href}`;

  // ── 읽어주기(TTS) ──
  const blocks = useMemo(() => content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean), [content]);
  const chunks = useMemo(() => blocks.map((b) => chunk(plain(b))), [blocks]);
  const [listen, setListen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [supported, setSupported] = useState(true);
  const tok = useRef(0), pos = useRef({ b: 0, c: 0 }), rateRef = useRef(1), voiceRef = useRef("");
  rateRef.current = rate; voiceRef.current = voiceURI;

  useEffect(() => {
    if (!("speechSynthesis" in window)) { setSupported(false); return; }
    const load = () => {
      const ko = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ko"));
      setVoices(ko); if (ko[0] && !voiceRef.current) setVoiceURI(ko[0].voiceURI);
    };
    load(); speechSynthesis.addEventListener("voiceschanged", load);
    return () => { speechSynthesis.removeEventListener("voiceschanged", load); speechSynthesis.cancel(); };
  }, []);
  useEffect(() => { const r = Number(localStorage.getItem("rate")); if (r) setRate(r); const s = Number(localStorage.getItem("fs")); if (s) setSize(s); }, []);
  useEffect(() => { try { localStorage.setItem("rate", String(rate)); localStorage.setItem("fs", String(size)); } catch {} }, [rate, size]);

  const run = useCallback((b: number, c: number, t: number) => {
    if (t !== tok.current) return;
    if (b >= blocks.length) { setPlaying(false); return; }
    const list = chunks[b];
    if (!list.length || c >= list.length) { run(b + 1, 0, t); return; }
    pos.current = { b, c }; setCur(b);
    const u = new SpeechSynthesisUtterance(list[c]);
    u.lang = "ko-KR"; u.rate = rateRef.current;
    const v = speechSynthesis.getVoices().find((x) => x.voiceURI === voiceRef.current); if (v) u.voice = v;
    u.onend = () => { if (t === tok.current) run(b, c + 1, t); };
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled" && t === tok.current) setPlaying(false); };
    speechSynthesis.speak(u);
  }, [blocks.length, chunks]);

  const start = useCallback((b: number, c = 0) => {
    tok.current++; speechSynthesis.cancel(); setListen(true); setPlaying(true);
    const t = tok.current; setTimeout(() => run(b, c, t), 60);
  }, [run]);
  const pause = () => { tok.current++; speechSynthesis.cancel(); setPlaying(false); };
  const toggle = () => (playing ? pause() : start(pos.current.b, pos.current.c));
  const jump = (d: number) => start(Math.min(Math.max(pos.current.b + d, 0), blocks.length - 1), 0);
  const closePlayer = () => { pause(); setListen(false); };
  const changeRate = (d: number) => {
    const i = Math.min(Math.max(RATES.indexOf(rate) + d, 0), RATES.length - 1); setRate(RATES[i]);
    rateRef.current = RATES[i]; if (playing) start(pos.current.b, pos.current.c);
  };
  useEffect(() => { if (playing) document.querySelector(`[data-b="${cur}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [cur, playing]);

  useEffect(() => {
    const f = () => { const h = document.documentElement; setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100); };
    window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f);
  }, []);

  // 본문 글 선택 → 복사/공유 바
  useEffect(() => {
    let timer: any;
    const f = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const g = window.getSelection();
        const text = g?.toString().trim() ?? "";
        const node = g?.anchorNode?.parentElement;
        if (!g || g.rangeCount === 0 || text.length < 2 || !node?.closest(".body")) { setSel(null); return; }
        const r = g.getRangeAt(0).getBoundingClientRect();
        const below = r.bottom + 60 < window.innerHeight - 150;
        setSel({ text, x: Math.min(Math.max(r.left + r.width / 2, 120), window.innerWidth - 120), y: below ? r.bottom + 12 : Math.max(r.top - 56, 70) });
      }, 180);
    };
    document.addEventListener("selectionchange", f); return () => { document.removeEventListener("selectionchange", f); clearTimeout(timer); };
  }, []);

  const summaryText = () => {
    if (summary) return mdToPlain(summary);
    if (!auto) return "";
    return `【핵심 문장】\n` + auto.top.map((x) => `• ${x}`).join("\n") + `\n\n【키워드】 ` + auto.keywords.map((k) => `#${k}`).join(" ");
  };

  const auto = useMemo(() => (sheet === "sum" && !summary ? summarize(content) : null), [sheet, summary, content]);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />

      <div className="body" style={{ fontSize: size }}>
        {blocks.map((b, i) => (
          <div key={i} data-b={i} className={`blk ${listen && i === cur ? "speaking" : ""}`} onClick={() => supported && listen && start(i)}>
            <ReactMarkdown>{b}</ReactMarkdown>
          </div>
        ))}
      </div>

      <div className="dock">
        {listen && (
          <div className="player">
            <button onClick={() => jump(-1)} aria-label="이전 문단">⏮</button>
            <button className="play" onClick={toggle} aria-label={playing ? "일시정지" : "재생"}>{playing ? "⏸" : "▶"}</button>
            <button onClick={() => jump(1)} aria-label="다음 문단">⏭</button>
            <div className="rate">
              <button onClick={() => changeRate(-1)} aria-label="느리게">−</button>
              <span>{rate.toFixed(2).replace(/0$/, "")}×</span>
              <button onClick={() => changeRate(1)} aria-label="빠르게">+</button>
            </div>
            {voices.length > 1 && (
              <select value={voiceURI} onChange={(e) => { setVoiceURI(e.target.value); voiceRef.current = e.target.value; if (playing) start(pos.current.b, pos.current.c); }}>
                {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name.replace(/Microsoft |Google /, "").slice(0, 14)}</option>)}
              </select>
            )}
            <span className="cnt">{cur + 1}/{blocks.length}</span>
            <button onClick={closePlayer} aria-label="닫기">✕</button>
          </div>
        )}
      </div>

      <nav className="tabbar">
        <Link href="/"><span>📚</span>설교</Link>
        {passage && <button className={sheet === "bible" ? "on" : ""} onClick={() => setSheet(sheet === "bible" ? "" : "bible")}><span>📖</span>성경</button>}
        <button className={sheet === "sum" ? "on" : ""} onClick={() => setSheet(sheet === "sum" ? "" : "sum")}><span>✨</span>요약</button>
        <button className={listen ? "on" : ""} onClick={() => { if (!supported) return alert("이 브라우저는 음성 읽기를 지원하지 않습니다."); listen ? closePlayer() : start(0); }}><span>🎧</span>듣기</button>
        <button onClick={() => setSize((x) => (x >= 26 ? 16 : x + 2))}><span className="ga">가</span>글자</button>
      </nav>

      {sel && (
        <div className="selbar" style={{ left: sel.x, top: sel.y }} onPointerDown={(e) => e.preventDefault()}>
          <button onClick={async () => { flash((await copyText(sel.text)) ? "복사했습니다" : TOAST.failed); }}>📋 복사</button>
          <button className="kakao" onClick={async () => { flash(TOAST[await shareText(sel.text + footer())]); }}>💬 카톡 공유</button>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}

      <Sheet open={sheet === "bible"} title={passage ?? ""} onClose={() => setSheet("")}>{passage && <BiblePanel passage={passage} onToast={flash} />}</Sheet>
      <Sheet open={sheet === "sum"} title="설교 요약" onClose={() => setSheet("")}>
        <div className="actions">
          <button onClick={async () => flash((await copyText(summaryText() + footer())) ? "복사했습니다" : TOAST.failed)}>📋 복사</button>
          <button className="kakao" onClick={async () => flash(TOAST[await shareText(summaryText() + footer())])}>💬 카톡 공유</button>
        </div>
        {summary ? <div className="md"><ReactMarkdown>{summary}</ReactMarkdown></div> : auto && (
          <div className="md">
            <h4>핵심 문장</h4><ul>{auto.top.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <h4>키워드</h4><div className="tags">{auto.keywords.map((k) => <span key={k}>#{k}</span>)}</div>
            <p className="note">직접 작성한 요약이 없어 자동 추출 요약을 보여 줍니다.</p>
          </div>
        )}
      </Sheet>
    </>
  );
}
