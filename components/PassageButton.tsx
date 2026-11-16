"use client";
export default function PassageButton({ passage }: { passage: string }) {
  return (
    <button className="pbtn" onClick={() => window.dispatchEvent(new Event("open-bible"))}>
      <span>📖 {passage}</span><i>구절 보기</i>
    </button>
  );
}
