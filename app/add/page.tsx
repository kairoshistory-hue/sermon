"use client";
import { useEffect, useState } from "react";
import { cleanTranscript, parseMeta } from "@/lib/clean";

type Meta = ReturnType<typeof parseMeta>;

export default function Add() {
  const [raw, setRaw] = useState("");
  const [meta, setMeta] = useState<Meta>(parseMeta(""));
  const [out, setOut] = useState("");
  const [applied, setApplied] = useState<string[]>([]);
  const [custom, setCustom] = useState("");   // "틀린말=맞는말" 한 줄씩

  useEffect(() => { try { setCustom(localStorage.getItem("fixes") ?? ""); } catch {} }, []);

  const extra = (): [string, string][] =>
    custom.split("\n").map((l) => l.split("=").map((x) => x.trim()) as [string, string]).filter(([a, b]) => a && b);

  function run() {
    try { localStorage.setItem("fixes", custom); } catch {}
    setMeta(parseMeta(raw));
    const r = cleanTranscript(raw, extra());
    setOut(r.markdown); setApplied(r.applied);
  }

  const fm = `---\n${Object.entries(meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n\n`;
  const filename = `${meta.date}-${meta.series.match(/\d+/)?.[0] ?? "sermon"}.md`;
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([fm + out], { type: "text/markdown" }));
    a.download = filename; a.click();
  }

  return (
    <div className="admin">
      <h1>새 설교 추가</h1>
      <p className="muted">YouTube 요약 확장 프로그램에서 복사한 텍스트를 붙여넣으세요. 시간 표시 제거와 오타 교정이 브라우저 안에서 무료로 처리됩니다.</p>

      <label className="lbl">① 원문 붙여넣기</label>
      <textarea className="ta" rows={9} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="여기에 붙여넣기" />

      <details className="dict">
        <summary>② 내 교정 사전 (선택)</summary>
        <p className="muted small">한 줄에 하나씩 <code>틀린말=맞는말</code> 형식. 이 브라우저에 저장되어 다음에도 적용됩니다.</p>
        <textarea className="ta" rows={4} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={"예)\n사사김=사사기"} />
      </details>

      <button className="btn" onClick={run} disabled={!raw}>정리하기</button>

      {out && (<>
        <label className="lbl">③ 정보 확인</label>
        <div className="grid">
          {(Object.keys(meta) as (keyof Meta)[]).map((k) => (
            <label key={k}><span>{k}</span><input value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} /></label>
          ))}
        </div>
        {applied.length > 0 && <p className="small muted">적용된 교정: {applied.join(" · ")}</p>}
        <label className="lbl">④ 본문 확인·수정 (<code>## 소제목</code>, <code>&gt; 인용</code> 직접 추가 가능)</label>
        <textarea className="ta" rows={22} value={out} onChange={(e) => setOut(e.target.value)} />
        <button className="btn" onClick={download}>{filename} 다운로드</button>
        <p className="small muted">다운로드한 파일을 저장소의 <code>content/sermons/</code>에 넣고 push하면 자동 배포됩니다.</p>
      </>)}
    </div>
  );
}
