// 휴대폰: 기본 공유 창(카카오톡 포함) / PC: 클립보드 복사
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
  }
}

export async function shareText(text: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try { await navigator.share({ text }); return "shared"; }
    catch (e: any) { if (e?.name === "AbortError") return "shared"; }
  }
  return (await copyText(text)) ? "copied" : "failed";
}

export const mdToPlain = (md: string) =>
  md.replace(/^#{1,3}\s*(.+)$/gm, "【$1】").replace(/^#{4,}\s*(.+)$/gm, "\n▶ $1").replace(/^\s*[-*]\s+/gm, "• ").replace(/[*_`]/g, "").replace(/\n{3,}/g, "\n\n").trim();

export const TOAST: Record<string, string> = { shared: "공유 창을 열었습니다", copied: "복사했습니다 — 카카오톡에 붙여넣기 하세요", failed: "복사하지 못했습니다" };
