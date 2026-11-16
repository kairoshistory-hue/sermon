import { NextResponse } from "next/server";
import { gemini, FIX_SYSTEM, SUMMARY_SYSTEM, STRUCT_SYSTEM } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { passcode, task, text, title, passage } = await req.json();
    if (passcode !== (process.env.ADMIN_PASSCODE || "2579")) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    const body = String(text ?? "").slice(0, 60000);
    if (body.length < 30) return NextResponse.json({ error: "원고가 너무 짧습니다." }, { status: 400 });

    if (task === "fixes") {
      const raw = await gemini(FIX_SYSTEM, body, { json: true, maxTokens: 4096 });
      const arr = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
      const fixes = (Array.isArray(arr) ? arr : [])
        .filter((x: any) => typeof x?.wrong === "string" && typeof x?.right === "string")
        .filter((x: any) => x.wrong.length >= 2 && x.wrong !== x.right && x.right.length <= x.wrong.length + 20 && body.includes(x.wrong))
        .slice(0, 80)
        .map((x: any) => [x.wrong, x.right]);
      return NextResponse.json({ fixes });
    }
    if (task === "summary") {
      const summary = await gemini(SUMMARY_SYSTEM, `제목: ${title ?? ""}\n본문: ${passage ?? ""}\n\n${body}`, { maxTokens: 8192 });
      return NextResponse.json({ summary: summary.replace(/^```(?:markdown)?\n?|```$/g, "").trim() });
    }
    if (task === "structure") {
      const raw = await gemini(STRUCT_SYSTEM, body, { json: true, maxTokens: 8192 });
      const plan = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
      return NextResponse.json({ plan });
    }
    return NextResponse.json({ error: "알 수 없는 작업" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "AI 처리 실패" }, { status: e.status ?? 500 });
  }
}
