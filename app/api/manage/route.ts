import { NextResponse } from "next/server";
import { deleteFile, getFile, putFile } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const { passcode, action, slug, markdown, summary } = await req.json();
    if (passcode !== (process.env.ADMIN_PASSCODE || "2579")) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    if (!process.env.GITHUB_TOKEN) return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 501 });
    if (!/^[\w-]+$/.test(slug ?? "")) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    const md = `content/sermons/${slug}.md`, sm = `content/sermons/${slug}.summary.md`;

    if (action === "get") {
      const [a, b] = await Promise.all([getFile(md), getFile(sm)]);
      if (!a) return NextResponse.json({ error: "저장소에서 설교 파일을 찾지 못했습니다." }, { status: 404 });
      return NextResponse.json({ markdown: a.text, summary: b?.text ?? "" });
    }
    if (action === "save") {
      if (!markdown?.trim()) return NextResponse.json({ error: "본문이 비어 있습니다." }, { status: 400 });
      await putFile(md, markdown, `설교 수정: ${slug}`);
      if (summary?.trim()) await putFile(sm, summary, `요약 수정: ${slug}`); else await deleteFile(sm, `요약 삭제: ${slug}`);
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") {
      await deleteFile(md, `설교 삭제: ${slug}`);
      await deleteFile(sm, `요약 삭제: ${slug}`);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "알 수 없는 작업" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "처리 실패" }, { status: 500 });
  }
}
