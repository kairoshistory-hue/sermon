import { NextResponse } from "next/server";
import { ask, SUMMARY_SYSTEM } from "@/lib/claude";
import { readSermon } from "@/lib/sermons";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug || /[\/\\.]/.test(slug)) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    const s = readSermon(slug);
    const summary = await ask(SUMMARY_SYSTEM, `제목: ${s.title}\n본문: ${s.passage ?? ""}\n\n${s.content}`, 2000);
    return NextResponse.json({ summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "요약 실패" }, { status: 500 });
  }
}
