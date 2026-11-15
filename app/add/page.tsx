"use client";
import { useEffect, useState } from "react";
import { cleanTranscript, parseMeta } from "@/lib/clean";
import { PREACHERS, findPreacher } from "@/lib/preachers";
import { copyText } from "@/lib/share";

type Meta = ReturnType<typeof parseMeta>;

export default function Add() {
  const [raw, setRaw] = useState("");
  const [meta, setMeta] = useState<Meta>(parseMeta(""));
  const [out, setOut] = useState("");
  const [summary, setSummary] = useState("");
  const [applied, setApplied] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try { setCustom(localStorage.getItem("fixes") ?? ""); } catch {}
  }, []);

  const extra = (): [string, string][] =>
    custom.split("\n").map((l) => l.split("=").map((x) => x.trim()) as [string, string]).filter(([a, b]) => a && b);

  function run() {
    try { localStorage.setItem("fixes", custom); } catch {}
    const m = parseMeta(raw);
    const p = findPreacher(m.preacher);
    setMeta({ ...m, preacher: p ? `${p.name} 목사` : m.preacher });
    const r = cleanTranscript(raw, extra());
    setOut(r.markdown); setApplied(r.applied); setMsg("");
  }

  const pid = findPreacher(meta.preacher)?.id ?? "etc";
  const num = meta.series.match(/\((\d+)\)/)?.[1];
  const slug = `${meta.date}-${pid}${num ? `-${num}` : ""}`;
  const fm = `---\n${Object.entries(meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n\n`;

  const prompt = `아래 설교 원고를 한국어로 요약해 주세요. 형식:\n\n### 주요 설교 요약\n\n#### 1. (소제목) (관련 절)\n- 핵심 내용 불릿 2~3개\n\n#### 2. ...\n\n#### 오늘의 적용\n- 적용 불릿 3개\n\n원고에 없는 내용은 넣지 말고, 마크다운으로 답해 주세요.\n\n제목: ${meta.title}\n본문: ${meta.passage}\n\n${out}`;

  function download(name: string, text: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" })); a.download = name; a.click();
  }

  return (
    <div className="admin">
      <h1>새 설교 추가</h1>
      <p className="muted">YouTube 요약 확장 프로그램에서 복사한 텍스트를 붙여넣으세요.</p>

      <label className="lbl">① 원문 붙여넣기</label>
      <textarea className="ta" rows={9} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="여기에 붙여넣기" />

      <details className="dict">
        <summary>내 교정 사전 (선택)</summary>
        <p className="muted small">한 줄에 하나씩 <code>틀린말=맞는말</code>. 이 브라우저에 저장됩니다.</p>
        <textarea className="ta" rows={4} value={custom} onChange={(e) => setCustom(e.target.value)} />
      </details>
      <button className="btn" onClick={run} disabled={!raw}>정리하기</button>

      {out && (<>
        <label className="lbl">② 정보 확인</label>
        <div className="grid">
          <label><span>설교자</span>
            <select value={findPreacher(meta.preacher)?.name ?? ""} onChange={(e) => setMeta({ ...meta, preacher: e.target.value ? `${e.target.value} 목사` : "" })}>
              <option value="">직접 입력/기타</option>
              {PREACHERS.map((p) => <option key={p.id} value={p.name}>{p.name} 목사 · {p.church}</option>)}
            </select>
          </label>
          {(["title", "series", "passage", "service", "date", "youtube"] as const).map((k) => (
            <label key={k}><span>{k}</span><input value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} /></label>
          ))}
        </div>
        {applied.length > 0 && <p className="small muted">적용된 교정: {applied.join(" · ")}</p>}

        <label className="lbl">③ 본문 확인·수정 (<code>## 소제목</code>, <code>&gt; 인용</code> 직접 추가 가능)</label>
        <textarea className="ta" rows={20} value={out} onChange={(e) => setOut(e.target.value)} />

        <label className="lbl">④ 요약 (선택)</label>
        <p className="muted small">“요약 요청문 복사”를 눌러 Claude 채팅에 붙여넣으면 형식에 맞춘 요약을 받을 수 있습니다. 결과를 아래에 붙여넣으세요.</p>
        <button className="btn ghost" onClick={async () => setMsg((await copyText(prompt)) ? "요약 요청문을 복사했습니다" : "복사 실패")}>요약 요청문 복사</button>
        <textarea className="ta" rows={10} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="### 주요 설교 요약 …" />

        <div className="row">
          <button className="btn" onClick={() => { download(`${slug}.md`, fm + out); if (summary) setTimeout(() => download(`${slug}.summary.md`, summary), 400); }}>파일 다운로드</button>
        </div>
        {msg && <p className="note-msg">{msg}</p>}
        <p className="small muted">다운로드한 파일(<code>{slug}.md</code>{summary ? <>, <code>{slug}.summary.md</code></> : null})을 저장소의 <code>content/sermons/</code> 폴더에 넣고 올리면(push) 사이트에 반영됩니다.</p>
      </>)}
    </div>
  );
}
