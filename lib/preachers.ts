// 설교자 이름 정리용 (직분은 바뀔 수 있어 표시하지 않습니다)
export const cleanPreacher = (s?: string) => (s ?? "").replace(/\s*(위임|담임|담당)?\s*목사님?$/, "").trim();
