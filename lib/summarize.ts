// 무료 요약: 외부 AI 없이 브라우저에서 계산하는 추출식 요약
const STOP = new Set("그리고 그러나 그래서 하지만 그런데 그들 사람 때문 세상 그것 이것 저것 우리 여러분 하나님 저는 제가 있습니다 합니다 입니다 됩니다 있는 하는 되는 것이 것은 것을 수가 때문에 그렇게 이렇게 어떻게 하나님은 하나님이 하나님의 주의 이름으로 축복합니다 같은 대한 위해 통해 여기서 지금 오늘 정말 너무 아니라 아닙니다 없습니다 합니까 있습니까".split(" "));
const JOSA = /(으로|에서|에게|까지|부터|처럼|께서|이다|입니다|이며|이고|은|는|이|가|을|를|의|에|도|만|와|과|로|께)$/;

export function splitSentences(text: string): string[] {
  return text
    .replace(/^#+\s.*$/gm, "")
    .replace(/^>\s?/gm, "")
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokens(s: string): string[] {
  return s
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => (w.length > 2 ? w.replace(JOSA, "") : w))
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

export function summarize(markdown: string, topN = 5) {
  const freq = new Map<string, number>();
  for (const t of tokens(markdown.replace(/^#+\s.*$/gm, ""))) freq.set(t, (freq.get(t) ?? 0) + 1);

  const score = (s: string) => {
    const t = tokens(s);
    if (t.length < 4 || s.length < 25 || s.length > 220) return 0;
    return t.reduce((a, w) => a + (freq.get(w) ?? 0), 0) / Math.sqrt(t.length);
  };

  const sentences = splitSentences(markdown);
  const top = sentences
    .map((s, i) => ({ s, i, sc: score(s) }))
    .sort((a, b) => b.sc - a.sc)
    .slice(0, topN)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);

  const keywords = [...freq.entries()]
    .filter(([w]) => w.length >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // 소제목별 핵심 한 문장
  const sections = markdown.split(/^## /m).slice(1).map((blk) => {
    const [head, ...rest] = blk.split("\n");
    const best = splitSentences(rest.join("\n"))
      .map((s) => ({ s, sc: score(s) }))
      .sort((a, b) => b.sc - a.sc)[0];
    return { heading: head.trim(), line: best?.s ?? "" };
  });

  return { top, keywords, sections };
}
