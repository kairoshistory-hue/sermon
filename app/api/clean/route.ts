import { NextResponse } from "next/server";
import { ask, CLEAN_SYSTEM } from "@/lib/claude";

export const maxDuration = 300;

// 타임스탬프 등 기계적으로 제거 가능한 것은 코드로 먼저 처리
function prestrip(raw: string) {
  return raw
    .replace(/^\s*\(\d{1,2}:\d{2}(?::\d{2})?\)\s*/gm, "")
    .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\)/g, "")
    .replace(/>>\s*/g, "")
    .replace(/^\s*\d+\t/gm, "");
}

export async function POST(req: Request) {
  try {
    const { raw, passcode } = await req.json();
    if (process.env.ADMIN_PASSCODE && passcode !== process.env.ADMIN_PASSCODE)
      return NextResponse.json({ error: "관리자 암호가 올바르지 않습니다." }, { status: 401 });
    if (!raw || raw.length < 50) return NextResponse.json({ error: "원고가 너무 짧습니다." }, { status: 400 });
    const text = prestrip(String(raw));
    const markdown = await ask(CLEAN_SYSTEM, text, 16000);
    return NextResponse.json({ markdown });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "정리 실패" }, { status: 500 });
  }
}
