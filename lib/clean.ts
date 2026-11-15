// 무료 원고 정리: 규칙 + 교정 사전 기반 (AI 사용 안 함)
export const DEFAULT_FIXES: [string, string][] = [
  ["길리앗", "길르앗"], ["성전가", "승전가"], ["톱당", "돕 땅"], ["돕으로", "돕 땅으로"],
  ["경설하", "경솔하"], ["경설한", "경솔한"], ["입단", "입다"], ["입달", "입다"], ["입다른", "입다는"],
  ["창녀", "창기"], ["창귀", "창기"], ["암몬 족들", "암몬 족속"], ["앞제", "압제"], ["혼합주에", "혼합주의에"],
  ["아스다롯", "아스다롯"], ["안목석", "미스베"],
  ["나시린", "나실인"], ["드릴라", "들릴라"], ["삼선", "삼손"], ["나답과 아비우", "나답과 아비후"],
  ["무난료", "무남독녀"], ["문난료", "무남독녀"], ["긍입니다", "긍휼입니다"], ["측은 지심", "측은지심"],
  ["굿뉴스", "굿 뉴스"], ["번제물로", "번제물로"], ["구속적 경륜", "구속적 경륜"],
];

const VOWEL_NAMES = ["입다"]; // 받침 없는 이름 뒤 조사 보정
function fixJosa(t: string) {
  for (const n of VOWEL_NAMES)
    t = t.replace(new RegExp(`${n}은`, "g"), `${n}는`).replace(new RegExp(`${n}을`, "g"), `${n}를`).replace(new RegExp(`${n}이(?![가-힣])`, "g"), `${n}가`);
  return t;
}

export function cleanTranscript(raw: string, extra: [string, string][] = []) {
  let t = raw
    .replace(/^\s*\d+\t/gm, "")                       // 줄 번호
    .replace(/^\[.*?YouTube\s*$/m, "")                // 제목줄은 메타로 따로 처리
    .replace(/^https?:\/\/\S+\s*$/gm, "")
    .replace(/^Transcript:\s*$/gm, "")
    .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\)/g, "")     // (00:01)
    .replace(/>>/g, "")
    .replace(/\s*\n\s*/g, " ")                        // 줄바꿈 합치기
    .replace(/\s{2,}/g, " ")
    .trim();

  const applied: string[] = [];
  for (const [a, b] of [...extra, ...DEFAULT_FIXES]) {
    if (a !== b && t.includes(a)) { t = t.split(a).join(b); applied.push(`${a} → ${b}`); }
  }
  t = fixJosa(t);

  // 문장 단위로 쪼개 5문장씩 문단 구성
  const sents = t.split(/(?<=[.?!])\s+/).filter(Boolean);
  const paras: string[] = [];
  for (let i = 0; i < sents.length; i += 5) paras.push(sents.slice(i, i + 5).join(" "));
  return { markdown: paras.join("\n\n"), applied };
}

export function parseMeta(raw: string) {
  const first = raw.split("\n")[0] ?? "";
  const url = raw.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/)?.[0] ?? "";
  const m = first.match(/\[(.+?)\]\s*(.+?)\s*\((.+?)\)\s*(.+?)ㅣ(.+?)ㅣ(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  return {
    youtube: url,
    service: m?.[1] ?? "",
    series: m?.[2] ?? "",
    passage: m?.[3] ?? "",
    title: m?.[4]?.trim() ?? "",
    preacher: m?.[5]?.trim() ?? "",
    date: m ? `${m[6]}-${m[7].padStart(2, "0")}-${m[8].padStart(2, "0")}` : new Date().toISOString().slice(0, 10),
  };
}
