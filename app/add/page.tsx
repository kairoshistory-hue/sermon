"use client";
import { useEffect, useState } from "react";
import { cleanTranscript, parseMeta } from "@/lib/clean";
import { PREACHERS, findPreacher } from "@/lib/preachers";

type Meta = ReturnType<typeof parseMeta>;
type Step = { label: string; state: "wait" | "run" | "ok" | "warn" | "err"; note?: string };
const LABELS = ["원문 정리 (시간 표시 제거·교정 사전)", "AI 오타 교정", "AI 요약 작성", "사이트에 올리기"];

async function post(url: string, body: any) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `요청 실패 (${r.status})`);
  return j;
}

export default function Add() {
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [raw, setRaw] = useState("");
  const [meta, setMeta] = useState<Meta>(parseMeta(""));
  const [custom, setCustom] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ slug: string; md: string; summary: string } | null>(null);
  const [fixes, setFixes] = useState<string[]>([]);

  useEffect(() => { try { setCustom(localStorage.getItem("fixes") ?? ""); const p = localStorage.getItem("adm"); if (p) setPass(p); } catch {} }, []);

  async function login() {
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: code }) });
    if (r.ok) { setPass(code); setBad(false); try { localStorage.setItem("adm", code); } catch {} } else setBad(true);
  }

  if (!pass) {
    return (
      <div className="admin gate">
        <h1>🔒 새 설교 추가</h1>
        <p className="muted">비밀번호를 입력하세요. (이 기기에서는 한 번만 입력합니다)</p>
        <input className="pin" type="password" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="비밀번호" autoFocus />
        {bad && <p className="err">비밀번호가 올바르지 않습니다.</p>}
        <button className="btn" onClick={login} disabled={!code}>확인</button>
      </div>
    );
  }

  const onPaste = (v: string) => { setRaw(v); const m = parseMeta(v); const p = findPreacher(m.preacher); setMeta({ ...m, preacher: p ? `${p.name} 목사` : m.preacher }); };
  const set = (i: number, s: Partial<Step>) => setSteps((a) => a.map((x, j) => (j === i ? { ...x, ...s } : x)));
  const pid = findPreacher(meta.preacher)?.id ?? "etc";
  const num = meta.series.match(/\((\d+)\)/)?.[1];
  const slug = `${meta.date}-${pid}${num ? `-${num}` : ""}`;

  async function go() {
    setBusy(true); setDone(null); setFixes([]);
    setSteps(LABELS.map((label) => ({ label, state: "wait" })));
    try {
      try { localStorage.setItem("fixes", custom); } catch {}
      const extra = custom.split("\n").map((l) => l.split("=").map((x) => x.trim()) as [string, string]).filter(([a, b]) => a && b);

      set(0, { state: "run" });
      const base = cleanTranscript(raw, extra); let md = base.markdown;
      set(0, { state: "ok", note: `교정 ${base.applied.length}건` });

      set(1, { state: "run" });
      try {
        const { fixes: pairs } = await post("/api/ai", { passcode: pass, task: "fixes", text: md });
        const used: string[] = [];
        for (const [a, b] of pairs as [string, string][]) if (md.includes(a)) { md = md.split(a).join(b); used.push(`${a}→${b}`); }
        setFixes(used); set(1, { state: "ok", note: `${used.length}건 교정` });
      } catch (e: any) { set(1, { state: "warn", note: `건너뜀: ${e.message}` }); }

      set(2, { state: "run" });
      let summary = "";
      try {
        summary = (await post("/api/ai", { passcode: pass, task: "summary", text: md, title: meta.title, passage: meta.passage })).summary;
        set(2, { state: "ok" });
      } catch (e: any) { set(2, { state: "warn", note: `건너뜀(자동 추출 요약 사용): ${e.message}` }); }

      const fm = `---\n${Object.entries(meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n---\n\n`;
      setDone({ slug, md: fm + md, summary });
      set(3, { state: "run" });
      try { await post("/api/publish", { passcode: pass, slug, markdown: fm + md, summary }); set(3, { state: "ok", note: "1~2분 뒤 사이트에 반영됩니다" }); }
      catch (e: any) { set(3, { state: "err", note: e.message }); }
    } finally { setBusy(false); }
  }

  const dl = (name: string, text: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" })); a.download = name; a.click(); };
  const ready = raw.trim().length > 300 && !!meta.title;

  return (
    <div className="admin">
      <h1>새 설교 추가</h1>
      <p className="muted">YouTube 요약 확장 프로그램에서 복사한 텍스트를 붙여넣고 버튼만 누르면, 정리·요약·게시까지 자동으로 됩니다.</p>

      <textarea className="ta" rows={9} value={raw} onChange={(e) => onPaste(e.target.value)} placeholder="여기에 붙여넣기 (맨 위 제목줄 포함)" />

      {raw && (
        <div className="detected">
          <b>{meta.title || "⚠️ 제목을 인식하지 못했습니다 — 맨 위 제목줄까지 붙여넣어 주세요"}</b>
          <span>{[meta.series, meta.passage, meta.preacher, meta.date].filter(Boolean).join(" · ")}</span>
          <details><summary>정보 수정</summary>
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
          </details>
        </div>
      )}

      <details className="dict"><summary>내 교정 사전 (선택)</summary>
        <p className="muted small">한 줄에 하나씩 <code>틀린말=맞는말</code>. 이 기기에 저장됩니다.</p>
        <textarea className="ta" rows={3} value={custom} onChange={(e) => setCustom(e.target.value)} />
      </details>

      <button className="btn big" onClick={go} disabled={!ready || busy}>{busy ? "처리 중… (1분 내외)" : "🚀 자동으로 정리하고 올리기"}</button>

      {steps.length > 0 && (
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={i} className={s.state}>
              <span>{{ wait: "○", run: "⏳", ok: "✅", warn: "⚠️", err: "❌" }[s.state]}</span> {s.label}
              {s.note && <small> — {s.note}</small>}
            </li>
          ))}
        </ol>
      )}
      {fixes.length > 0 && <p className="small muted">AI 교정: {fixes.join(" · ")}</p>}

      {done && (
        <div className="result">
          <a className="btn" href={`/sermons/${done.slug}`}>설교 페이지 열어 보기</a>
          <button className="btn ghost" onClick={() => { dl(`${done.slug}.md`, done.md); if (done.summary) setTimeout(() => dl(`${done.slug}.summary.md`, done.summary), 400); }}>파일로도 받기</button>
          <p className="small muted">게시가 실패했다면 받은 파일을 저장소 <code>content/sermons/</code>에 올리면 됩니다.</p>
        </div>
      )}
    </div>
  );
}
