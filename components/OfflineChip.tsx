"use client";
import { useEffect, useState } from "react";
import { canOffline, isSaved, saveSermon } from "@/lib/offline";

export default function OfflineChip({ slug, passage }: { slug: string; passage?: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { isSaved(slug).then(setSaved); }, [slug]);
  if (!canOffline()) return null;
  async function go() {
    setBusy(true); setMsg("");
    try { await saveSermon(slug, passage); setSaved(true); setMsg("저장했습니다. 인터넷 없이도 볼 수 있어요."); }
    catch { setMsg("저장하지 못했습니다. 인터넷 연결을 확인하세요."); } finally { setBusy(false); }
  }
  return (
    <>
      <button className={`editlink ${saved ? "saved" : ""}`} onClick={go} disabled={busy}>
        {busy ? "저장 중…" : saved ? "✓ 오프라인 저장됨 · 업데이트" : "📥 오프라인 저장"}
      </button>
      {msg && <p className="small muted" style={{ margin: "6px 0 0" }}>{msg}</p>}
    </>
  );
}
