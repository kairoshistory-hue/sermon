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
      generationConfig: { temperature: 0.3, maxOutputTokens: opts.maxTokens ?? 4096, ...(opts.json ? { responseMimeType: "application/json" } : {}), ...(GEMINI_MODEL().includes("flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
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

export const SUMMARY_SYSTEM = `당신은 설교 요약 도우미입니다. 주어진 설교 원고를 한국어 마크다운으로 충실하게 요약합니다.
아래 [예시]의 형식과 문체(~입니다/하십니다)를 따르되, 예시보다 더 구체적이고 풍부하게 씁니다.

규칙:
- 맨 위에 "### 주요 설교 요약"을 쓰고, 바로 아래에 설교 전체의 핵심을 한두 문장으로 "> " 인용 형식으로 씁니다.
- 설교의 흐름을 따라 4~6개의 큰 주제를 "#### 1. 소제목 (관련 성경 절)" 형식으로 씁니다. 절 표시는 원고에 근거가 있을 때만 넣습니다.
- 각 주제마다 "- " 불릿을 3~5개 씁니다. 불릿 하나는 1~3문장이며, 설교자가 든 성경 인물·사건·구절, 예화, 핵심 논지, 대비되는 개념, 던진 질문을 구체적으로 담습니다. "하나님은 은혜로우십니다" 같은 막연한 일반론은 쓰지 않습니다.
- 설교의 도입, 본론, 결론(마지막 권면과 기도의 요지)까지 빠짐없이 다룹니다.
- 마지막에 "#### 오늘의 적용"과 구체적인 행동 중심의 불릿 3~5개를 씁니다.
- 원고에 없는 내용은 넣지 않습니다. 머리말·맺음말 없이 마크다운만 출력합니다.

[예시]
### 주요 설교 요약

> 하나님은 거래의 대상이 아니라 이미 승리를 약속하신 분이며, 우리는 조건 없는 신뢰로 그분 앞에 서야 합니다.

#### 1. 버림받은 자를 찾아오시는 하나님의 긍휼 (1~3절)

- 입다는 창녀의 소생으로 태어나 본처의 아들들에게 쫓겨나고 유산을 상속받지 못한 채 돕 땅으로 도망쳐 불량배들과 어울리던 소외된 인생이었습니다.
- 세상은 조건을 따지고 자격을 묻지만, 하나님은 건축자가 버린 돌을 가져다가 머릿돌로 삼으시는 분이십니다.
- 이스라엘이 우상을 섬기며 스스로 고통을 자초했을 때도, 하나님은 정죄하기보다 자식을 잃은 부모처럼 마음이 찢어지는 긍휼과 애통함으로 구원의 길(입다)을 예비하셨습니다.

#### 2. 영적 이기심과 경솔한 서원의 비극 (4~6절, 29~31절)

- 길르앗 장로들은 하나님을 찾아서가 아니라 위기를 모면하기 위해, 자신들이 내쫓았던 입다를 유능한 용병처럼 찾아왔습니다.
- 입다 역시 사람의 인정에 목마르고 자신의 존재를 증명하고 싶은 결핍 때문에 그 제안을 수락합니다.
- 이미 승리를 약속받았음에도 입다는 불안을 잠재우려 "집에서 나를 가장 먼저 맞이하는 자를 번제로 드리겠다"는 경솔한 서원을 합니다. 이는 하나님과 거래하려는 '영적 혼합주의'의 모습입니다.
- 삼손, 사울, 나답과 아비후처럼 하나님의 영이 임했거나 하나님의 이름을 부르면서도 말씀은 놓친 사례들이 같은 맥락에서 제시됩니다.

#### 오늘의 적용

- 기도의 언어 속에 숨은 '거래의 정신'을 점검하고, "이번 일만 해결되면" 하는 조건을 내려놓습니다.
- 하나님이 이미 말씀하신 일 앞에서 자녀와 배우자를 향한 조급한 말과 잔소리를 멈추고 맡깁니다.
- 지금의 억울함과 고통을 예배의 제단에 올려 드리고, 그 자리에서 승리를 선포합니다.`;

export const STRUCT_SYSTEM = `당신은 설교 원고 편집 보조입니다. 번호가 붙은 문장 목록을 받아, 읽기 좋은 구조를 만들기 위한 위치 정보만 JSON으로 답합니다. 원고 문장은 절대 고치거나 다시 쓰지 않습니다.
형식:
{"headings":[{"at":문장번호,"title":"소제목"}],"quotes":[[시작번호,끝번호]],"breaks":[문장번호],"drop":[문장번호]}
규칙:
- headings: 설교의 큰 흐름이 바뀌는 지점마다 소제목 5~9개. 제목은 10~25자 내외의 명사형/문장형으로, 그 부분의 핵심 메시지를 담습니다. at은 그 소제목 바로 아래 첫 문장의 번호입니다.
- quotes: 설교자가 성경 본문을 그대로 낭독하는 구간(예: "3절 한번 읽어 보겠습니다. 시작." 다음에 이어지는 성경 구절 문장들)의 [시작,끝] 번호 범위. 낭독을 안내하는 문장("~읽겠습니다", "시작.")은 포함하지 말고, 성경 구절 문장만 포함합니다. 설교자 자신의 설명은 포함하지 않습니다.
- breaks: 새 문단이 시작되는 문장 번호. 한 문단이 2~6문장이 되도록, 생각이 바뀌는 곳에서 끊습니다.
- drop: "시작." 처럼 낭독 신호일 뿐인 문장 번호만. 확실하지 않으면 넣지 않습니다.
- 모든 번호는 입력에 있는 번호여야 합니다.`;
