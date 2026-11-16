export type Church = { id: string; name: string };

// 교회(폴더) 목록. 담당 목사님이 바뀌어도 설교는 교회 폴더에 그대로 쌓입니다.
export const CHURCHES: Church[] = [
  { id: "yongin", name: "용인온누리교회" },
  { id: "hq", name: "온누리교회(본부)" },
];

// 설교자 → 교회. 담당이 바뀌면 여기만 고치면 됩니다.
// (설교 파일 머리말에 `church: yongin` 또는 `church: hq` 를 적으면 그것이 우선합니다.)
export const PREACHER_CHURCH: Record<string, string> = {
  "양재경": "yongin",
  "이재훈": "hq",
};

export function churchOf(preacher?: string, field?: string): Church | undefined {
  if (field) {
    const f = CHURCHES.find((c) => c.id === field || c.name === field);
    if (f) return f;
  }
  const name = Object.keys(PREACHER_CHURCH).find((n) => preacher?.includes(n));
  return CHURCHES.find((c) => c.id === (name ? PREACHER_CHURCH[name] : ""));
}
