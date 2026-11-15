// 무료 원고 정리: 규칙 + 교정 사전 기반 (AI 사용 안 함)
export const DEFAULT_FIXES: [string, string][] = [
  ["길리앗", "길르앗"], ["성전가", "승전가"], ["톱당", "돕 땅"], ["돕으로", "돕 땅으로"],
  ["경설하", "경솔하"], ["경설한", "경솔한"], ["입단", "입다"], ["입달", "입다"], ["입다른", "입다는"],
  ["창녀", "창기"], ["창귀", "창기"], ["암몬 족들", "암몬 족속"], ["앞제", "압제"], ["혼합주에", "혼합주의에"],
  ["아스다롯", "아스다롯"], ["안목석", "미스베"],
  ["나시린", "나실인"], ["드릴라", "들릴라"], ["삼선", "삼손"], ["나답과 아비우", "나답과 아비후"],
  ["무난료", "무남독녀"], ["문난료", "무남독녀"], ["긍입니다", "긍휼입니다"], ["측은 지심", "측은지심"],
  ["굿뉴스", "굿 뉴스"],
  ["복임", "보김"], ["복김", "보김"], ["광해 설교", "강해 설교"], ["요호수아", "여호수아"], ["병곡점", "변곡점"],
  ["문화세 지파", "므낫세 지파"], ["철봉거", "철병거"], ["아세랍니다", "아세라입니다"], ["히스기아", "히스기야"],
  ["아수르", "앗수르"], ["노욕을", "노역을"], ["가단한 땅", "가나안 땅"], ["할례를 향했", "할례를 행했"],
  ["가지옷", "가죽옷"], ["선악가", "선악과"], ["니누로", "니느웨로"], ["노뎀나무", "로뎀나무"], ["곡관을", "곳간을"],
  ["무기고를 울고", "무기고를 열고"], ["풍요와 타산", "풍요와 다산"], ["세본이라", "세 번이나"], ["보표적인", "보편적인"],
  ["그 질소와", "그 질서와"], ["아악선이", "아낙 자손이"], ["솔로몬에게 지혜와 영광과 불을", "솔로몬에게 지혜와 영광과 부를"], ["번제물로", "번제물로"], ["구속적 경륜", "구속적 경륜"],
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
    .replace(/^\s*(?:\(\d+\)\s*)?\[[^\]]+\][^\n]*?ㅣ[^\n]*?ㅣ[\d.]+\s*-\s*YouTube\s*/, "") // 제목줄은 메타로 따로 처리
    .replace(/\[(?:한숨|음악|박수|웃음|기도)\]\s*/g, "")
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
  const url = raw.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+/)?.[0] ?? "";
  const m = raw.slice(0, 600).match(/\[([^\]]+)\]\s*([^ㅣ\n]+?)\s*ㅣ\s*([^ㅣ\n]+?)\s*ㅣ\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  let series = "", title = "", passage = "";
  if (m) {
    let mid = m[2].trim();
    const pm = mid.match(/\(\s*([가-힣]+\s*\d+\s*:\s*[\d\-, ]+)\s*\)\s*$/);
    if (pm) { passage = pm[1].replace(/\s+/g, " ").trim(); mid = mid.slice(0, pm.index).trim(); }
    const sm = mid.match(/^(.+?\(\d+\))\s*(.*)$/);
    if (sm) { series = sm[1]; title = sm[2].trim(); } else title = mid;
  }
  return {
    youtube: url,
    service: m?.[1] ?? "",
    series, passage, title,
    preacher: m?.[3]?.trim() ?? "",
    date: m ? `${m[4]}-${m[5].padStart(2, "0")}-${m[6].padStart(2, "0")}` : new Date().toISOString().slice(0, 10),
  };
}
