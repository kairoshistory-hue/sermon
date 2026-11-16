"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { autoStructure } from "@/lib/structure";

async function post(url: string, body: any) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `요청 실패 (${r.status})`);
  return j;
}

const FIELDS = ["title", "series", "passage", "preacher", "service", "date", "youtube"] as const;

function parse(text: string) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n*([\s\S]*)$/);
  const meta: Record<string, string> = {};
  if (!m) return { meta, body: text };
  for (const l of m[1].split(/\r?\n/)) { const i = l.indexOf(":"); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  return { meta, body: m[2] };
}

export default function Edit() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { try { const p = localStorage.getItem("adm"); if (p) setPass(p); } catch {} }, []);

  useEffect(() => {
    if (!pass) return;
    setMsg("불러오는 중…");
    post("/api/manage", { passcode: pass, action: "get", slug })
      .then((j) => { const p = parse(j.markdown); setMeta(p.meta); setBody(p.body); setSummary(j.summary); setLoaded(true); setMsg(""); })
      .catch((e) => setMsg(`⚠️ ${e.message}`));
  }, [pass, slug]);

  async function login() {
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: code }) });
    if (r.ok) { setPass(code); setBad(false); try { localStorage.setItem("adm", code); } catch {} } else setBad(true);
  }

  if (!pass) {
    return (
      <div className="admin gate">
        <h1>🔒 설교 편집</h1>
        <input className="pin" type="password" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="비밀번호" autoFocus />
        {bad && <p className="err">비밀번호가 올바르지 않습니다.</p>}
        <button className="btn" onClick={login} disabled={!code}>확인</button>
      </div>
    );
  }

  const fm = () => `---\n${FIELDS.filter((k) => meta[k]).map((k) => `${k}: ${meta[k]}`).join("\n")}\n---\n\n`;

  async function save() {
    setBusy(true); setMsg("");
    try { await post("/api/manage", { passcode: pass, action: "save", slug, markdown: fm() + body, summary }); setMsg("✅ 저장했습니다. 1~2분 뒤 사이트에 반영됩니다."); }
    catch (e: any) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm("이 설교와 요약을 삭제할까요? 되돌릴 수 없습니다.")) return;
    setBusy(true); setMsg("");
    try { await post("/api/manage", { passcode: pass, action: "delete", slug }); alert("삭제했습니다. 1~2분 뒤 목록에서 사라집니다."); router.push("/"); }
    catch (e: any) { setMsg(`⚠️ ${e.message}`); setBusy(false); }
  }
  async function restructure() {
    if (!confirm("기존 소제목·인용 표시를 지우고 AI가 다시 정리합니다. 계속할까요? (저장 전에는 사이트에 반영되지 않습니다)")) return;
    setBusy(true); setMsg("AI가 소제목과 성경 인용을 정리하는 중… (1분 내외)");
    try { setBody(await autoStructure(body, pass)); setMsg("✅ 정리했습니다. 본문을 확인한 뒤 저장하세요."); }
    catch (e: any) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  }
  async function regen() {
    setBusy(true); setMsg("AI가 요약을 다시 쓰는 중…");
    try { const j = await post("/api/ai", { passcode: pass, task: "summary", text: body, title: meta.title, passage: meta.passage }); setSummary(j.summary); setMsg("✅ 새 요약을 만들었습니다. 확인 후 저장하세요."); }
    catch (e: any) { setMsg(`⚠️ ${e.message}`); } finally { setBusy(false); }
  }

  return (
    <div className="admin">
      <h1>설교 편집</h1>
      <p className="muted small">{slug}</p>
      {msg && <p className="note-msg">{msg}</p>}
      {loaded && (<>
        <div className="grid">
          {FIELDS.map((k) => <label key={k}><span>{k}</span><input value={meta[k] ?? ""} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} /></label>)}
        </div>
        <label className="lbl">본문 (<code>## 소제목</code>, <code>&gt; 인용</code>, 문단은 빈 줄로 구분)</label>
        <textarea className="ta" rows={24} value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="lbl">요약 (비우면 요약 파일이 삭제되고 자동 추출 요약이 쓰입니다)</label>
        <textarea className="ta" rows={14} value={summary} onChange={(e) => setSummary(e.target.value)} />
        <div className="row">
          <button className="btn" onClick={save} disabled={busy}>💾 저장</button>
          <button className="btn ghost" onClick={restructure} disabled={busy}>🧩 소제목·인용 자동 정리</button>
          <button className="btn ghost" onClick={regen} disabled={busy}>✨ 요약 다시 만들기</button>
          <a className="btn ghost" href={`/sermons/${slug}`}>돌아가기</a>
          <button className="btn danger" onClick={remove} disabled={busy}>🗑 삭제</button>
        </div>
      </>)}
    </div>
  );
}
