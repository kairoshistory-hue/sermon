import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

export function client() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
  return new Anthropic();
}

export async function ask(system: string, user: string, maxTokens = 4096) {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

export const CLEAN_SYSTEM = `당신은 한국어 설교 원고 편집자입니다. YouTube 자동 자막(음성 인식) 텍스트를 설교 원고로 다듬습니다.
규칙:
1. (00:01) 같은 타임스탬프, 'Transcript:' 머리말, '>>' 기호를 모두 제거합니다.
2. 음성 인식 오탈자·오인식을 문맥과 성경 지식으로 바로잡습니다 (예: 길리앗→길르앗, 성전가→승전가, 톱당→돕 땅, 경설→경솔, 아람의 신들 등 고유명사·성경 용어).
3. 성경 본문 낭독 부분은 인용문(> )으로 표시합니다.
4. 의미 단위로 문단을 나누고, 큰 흐름마다 '## 소제목'을 붙입니다.
5. 설교자의 말투와 내용은 바꾸거나 요약·삭제하지 않습니다. 불확실한 단어는 원문을 유지합니다.
6. 출력은 본문 마크다운만. 설명이나 머리말을 덧붙이지 않습니다.`;

export const SUMMARY_SYSTEM = `당신은 설교 요약 도우미입니다. 주어진 설교 원고를 한국어로 요약합니다.
형식:
**한 줄 요약** (1문장)
**핵심 메시지** (3~5개 불릿)
**본문 흐름** (소제목별 1~2문장)
**적용 질문** (묵상/나눔 질문 3개)
원문에 없는 내용은 추가하지 않습니다.`;
