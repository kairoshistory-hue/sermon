// Google Gemini 무료 등급 (https://aistudio.google.com/apikey 에서 무료 키 발급)
export const GEMINI_MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function gemini(system: string, user: string, opts: { json?: boolean; maxTokens?: number } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error("GEMINI_API_KEY가 설정되지 않았습니다."), { status: 501 });
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: opts.maxTokens ?? 4096, ...(opts.json ? { responseMimeType: "application/json" } : {}) },
    }),
  });
  if (!r.ok) throw new Error(`Gemini 오류 (${r.status}) ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const text = (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini가 빈 응답을 보냈습니다.");
  return text;
}

export const FIX_SYSTEM = `당신은 한국어 설교의 음성 인식(자동 자막) 교정 보조입니다.
아래 원고에서 음성 인식 오류가 확실한 표현만 찾아 JSON 배열로만 답하세요.
형식: [{"wrong":"원고에 글자 그대로 있는 틀린 표현","right":"올바른 표현"}]
규칙:
- 성경 인명·지명·용어(예: 보김, 길르앗, 므낫세, 철병거), 교회 용어, 명백한 오탈자 위주
- wrong은 원고에 그대로 존재해야 하고 2글자 이상, 조사까지 포함해 right도 자연스러운 문장이 되게
- 문체 개선, 의미 변경, 문장 재작성 금지. 확실하지 않으면 제외
- 최대 80개`;

export const SUMMARY_SYSTEM = `당신은 설교 요약 도우미입니다. 주어진 설교 원고를 한국어 마크다운으로 요약합니다.
아래 [예시]와 똑같은 형식과 문체(~입니다/하십니다)를 따르세요.
규칙:
- "### 주요 설교 요약" 아래에 설교의 흐름에 따라 3~4개의 큰 주제를 "#### 1. 소제목 (관련 성경 절)" 형식으로 씁니다. 절 표시는 본문에 근거가 있을 때만 넣습니다.
- 각 주제에 핵심 내용을 "- " 불릿 2~4개로, 구체적인 인물·사건·설교자의 논지를 담아 씁니다.
- 마지막에 "#### 오늘의 적용"과 불릿 3개를 씁니다.
- 원고에 없는 내용은 넣지 않습니다. 머리말·맺음말 없이 마크다운만 출력합니다.

[예시]
### 주요 설교 요약

#### 1. 버림받은 자를 찾아오시는 하나님의 긍휼 (1~3절)

- 입다는 창녀의 소생으로 태어나 본처의 아들들에게 쫓겨나고 유산을 상속받지 못한 채 돕 땅으로 도망쳐 불량배들과 어울리던 소외된 인생이었습니다.
- 세상은 조건을 따지고 자격을 묻지만, 하나님은 건축자가 버린 돌을 가져다가 머릿돌로 삼으시는 분이십니다.

#### 2. 영적 이기심과 경솔한 서원의 비극 (4~6절, 29~31절)

- 길르앗 장로들은 하나님을 찾아서가 아니라 위기를 모면하기 위해, 자신들이 내쫓았던 입다를 유능한 용병처럼 찾아왔습니다.
- 이미 승리를 약속받았음에도 입다는 불안을 잠재우려 "집에서 나를 가장 먼저 맞이하는 자를 번제로 드리겠다"는 경솔한 서원을 합니다. 이는 하나님과 거래하려는 '영적 혼합주의'의 모습입니다.

#### 오늘의 적용

- 기도의 언어 속에 숨은 '거래의 정신'을 점검합니다.
- 하나님이 이미 말씀하신 일 앞에서 조급한 말을 멈추고 맡깁니다.
- 지금의 억울함과 고통을 예배의 제단에 올려 드립니다.`;
