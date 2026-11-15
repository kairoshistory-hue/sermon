"use client";
import { useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

export default function Add() {
  const [raw, setRaw] = useState("");
  const [passcode, setPasscode] = useState("");
  const [meta, setMeta] = useState({ title: "", series: "", passage: "", preacher: "", service: "", date: today(), youtube: "" });
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 확장 프로그램 출력의 첫 줄(제목)·URL에서 메타데이터를 대략 채움
  function autofill(text: string) {
    setRaw(text);
    const url = text.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/)?.[0];
    const first = text.split("\n")[0] ?? "";
    const m = first.match(/\[(.+?)\]\s*(.+?)\s*\((.+?)\)\s*(.+?)ㅣ(.+?)ㅣ([\d.]+)/);
    setMeta((p) => ({
      ...p,
      youtube: url ?? p.youtube,
      ...(m ? { service: m[1], series: m[2].replace(/\s*\(\d+\)/, (x) => x), passage: m[3] ? p.passage : p.passage, title: m[4].trim(), preacher: m[5].trim(), date: m[6].replace(/\./g, "-").replace(/^(\d{4})-(\d{2})-(\d{2}).*/, "$1-$2-$3") } : {}),
    }));
  }

  async function clean() {
    setLoading(true); setErr(""); setOut("");
    try {
      const r = await fetch("/api/clean", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw, passcode }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setOut(j.markdown);
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  const fm = `---\n${Object.entries(meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n\n`;
  const full = fm + out;
  const filename = `${meta.date}-${(meta.series.match(/\d+/)?.[0] ?? "sermon")}.md`;

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([full], { type: "text/markdown" }));
    a.download = filename; a.click();
  }

  return (
    <>
      <h1>새 설교 추가</h1>
      <p className="muted">YouTube 요약 확장 프로그램에서 복사한 전체 텍스트를 붙여넣으세요. 타임스탬프 제거와 오타 교정을 자동으로 합니다.</p>
      <textarea className="ta" rows={10} placeholder="여기에 붙여넣기" value={raw} onChange={(e) => autofill(e.target.value)} />
      <div className="grid">
        {(Object.keys(meta) as (keyof typeof meta)[]).map((k) => (
          <label key={k}>{k}<input value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} /></label>
        ))}
        <label>관리자 암호(설정한 경우)<input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} /></label>
      </div>
      <button className="btn" onClick={clean} disabled={loading || !raw}>{loading ? "정리 중… (1~2분)" : "원고 정리하기"}</button>
      {err && <p className="err">{err}</p>}
      {out && (
        <>
          <h2>미리보기 (직접 수정 가능)</h2>
          <textarea className="ta" rows={20} value={out} onChange={(e) => setOut(e.target.value)} />
          <button className="btn" onClick={download}>{filename} 다운로드</button>
          <p className="muted small">다운로드한 파일을 <code>content/sermons/</code> 폴더에 넣고 git push 하면 Vercel이 자동 배포합니다.</p>
        </>
      )}
    </>
  );
}
