export type Plan = { headings?: { at: number; title: string }[]; quotes?: [number, number][]; breaks?: number[]; drop?: number[] };

const toSentences = (text: string) =>
  text.replace(/\s*\n+\s*/g, " ").split(/(?<=[.?!”"])\s+/).map((s) => s.trim()).filter(Boolean);

// 기존 마크다운에서 소제목·인용 표시를 걷어낸 순수 본문 문장 목록
export function plainSentences(md: string) {
  return toSentences(md.replace(/^#{1,6}\s.*$/gm, "").replace(/^>\s?/gm, ""));
}

export function buildMarkdown(sents: string[], plan: Plan) {
  const n = sents.length;
  const ok = (i: any) => Number.isInteger(i) && i >= 0 && i < n;
  const head = new Map<number, string>();
  for (const h of plan.headings ?? []) if (ok(h?.at) && typeof h.title === "string" && h.title.trim()) head.set(h.at, h.title.trim().replace(/^#+\s*/, ""));
  const quote = new Map<number, number>();
  for (const q of plan.quotes ?? []) if (Array.isArray(q) && ok(q[0]) && ok(q[1]) && q[1] >= q[0] && q[1] - q[0] < 40) quote.set(q[0], q[1]);
  const drop = new Set((plan.drop ?? []).filter(ok).filter((i) => sents[i].length <= 12));
  const brk = new Set((plan.breaks ?? []).filter(ok));

  const blocks: string[] = []; let cur: string[] = [];
  const flush = () => { if (cur.length) blocks.push(cur.join(" ")); cur = []; };
  for (let i = 0; i < n; i++) {
    if (head.has(i)) { flush(); blocks.push(`## ${head.get(i)}`); }
    if (quote.has(i)) {
      flush(); const e = quote.get(i)!;
      blocks.push("> " + sents.slice(i, e + 1).filter((_, k) => !drop.has(i + k)).join(" ")); i = e; continue;
    }
    if (drop.has(i)) continue;
    if (brk.has(i) || cur.length >= 7) flush();
    cur.push(sents[i]);
  }
  flush();
  return blocks.join("\n\n");
}

// 본문(마크다운 또는 일반 텍스트)을 AI로 소제목·인용·문단 구조로 정리
export async function autoStructure(md: string, passcode: string) {
  const sents = plainSentences(md);
  if (sents.length < 8) throw new Error("본문이 너무 짧습니다.");
  const r = await fetch("/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode, task: "structure", text: sents.map((s, i) => `[${i}] ${s}`).join("\n") }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `요청 실패 (${r.status})`);
  const out = buildMarkdown(sents, j.plan ?? {});
  if (!out.includes("## ")) throw new Error("AI가 소제목을 만들지 못했습니다.");
  return out;
}
