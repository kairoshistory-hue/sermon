"use client";
import { useEffect, useState } from "react";
import { canOffline, savedCount, saveHome, saveSermon } from "@/lib/offline";

export default function OfflineAll({ items }: { items: { slug: string; passage?: string }[] }) {
  const [n, setN] = useState(0);
  const [busy, setBusy] = useState("");
  useEffect(() => { savedCount(items.map((i) => i.slug)).then(setN); }, [items]);
  if (!canOffline() || items.length === 0) return null;
  async function go() {
    let done = 0;
    try {
      await saveHome();
      for (const it of items) { setBusy(`저장 중… ${done + 1}/${items.length}`); await saveSermon(it.slug, it.passage); done++; }
    } catch {}
    setBusy(""); setN(await savedCount(items.map((i) => i.slug)));
  }
  return (
    <div className="offline-all">
      <button className="chip" onClick={go} disabled={!!busy}>{busy || "📥 전체 설교 오프라인 저장"}</button>
      <span className="small muted">{n}/{items.length}편 저장됨</span>
    </div>
  );
}
