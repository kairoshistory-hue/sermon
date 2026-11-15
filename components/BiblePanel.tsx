"use client";
import { useEffect, useState } from "react";
import { parsePassage } from "@/lib/bible";
import { copyText, shareText, TOAST } from "@/lib/share";

type V = { name: string; verses: { n: number; text: string }[] };

export default function BiblePanel({ passage, onToast }: { passage: string; onToast: (m: string) => void }) {
  const [data, setData] = useState<V[] | null>(null);
  const [tab, setTab] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        try {
          const r = await fetch(`/api/bible?passage=${encodeURIComponent(passage)}`);
          const j = await r.json();
          if (!r.ok) throw new Error(j.error);
          if (!dead) setData(j.versions);
        } catch (first: any) {
          const ref = parsePassage(passage);
          if (!ref) throw first;
          const r = await fetch(`https://api.goodtv.co.kr/onlinebible/bibleread/read-all?version1=0&version2=7&version3=5&bible_code=${ref.code}&jang=${ref.chapter}`);
          const d = (await r.json()).data.data;
          const inR = (n: number) => ref.ranges.some(([a, b]) => n >= a && n <= b);
          if (!dead) setData(["version1", "version2", "version3"].map((k) => ({ name: d[k].version_name, verses: d[k].content.filter((c: any) => inR(c.jul)).map((c: any) => ({ n: c.jul, text: c.text })) })));
        }
      } catch (e: any) { if (!dead) setErr(e.message || "성경 본문을 불러오지 못했습니다."); }
    })();
    return () => { dead = true; };
  }, [passage]);

  const bibleText = () =>
    data ? `${passage} [${data[tab].name}]\n\n` + data[tab].verses.map((v) => `${v.n} ${v.text}`).join("\n") : "";

  return (
    <div>
      <div className="seg">
        {(data ?? [{ name: "개역개정" }, { name: "우리말성경" }, { name: "NIV" }]).map((v, i) => (
          <button key={i} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>{v.name}</button>
        ))}
      </div>
      {!data && !err && <p className="muted">불러오는 중…</p>}
      {err && <p className="err">{err}</p>}
      {data && (
        <div className="actions">
          <button onClick={async () => onToast((await copyText(bibleText())) ? "복사했습니다" : TOAST.failed)}>📋 복사</button>
          <button className="kakao" onClick={async () => onToast(TOAST[await shareText(bibleText())])}>💬 카톡 공유</button>
        </div>
      )}
      {data && (
        <div className="verses">
          {data[tab].verses.map((v, i) => {
            const gap = i > 0 && v.n !== data[tab].verses[i - 1].n + 1;
            return <p key={v.n} className={gap ? "gap" : ""}><sup>{v.n}</sup>{v.text}</p>;
          })}
        </div>
      )}
    </div>
  );
}
