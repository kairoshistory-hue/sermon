import { NextResponse } from "next/server";
import { parsePassage } from "@/lib/bible";

export const revalidate = 86400;

// version1=개역개정(0), version2=우리말성경(7), version3=NIV(5)
export async function GET(req: Request) {
  const passage = new URL(req.url).searchParams.get("passage") ?? "";
  const ref = parsePassage(passage);
  if (!ref) return NextResponse.json({ error: "본문 형식을 읽을 수 없습니다 (예: 사사기 11:1-6, 29-35)" }, { status: 400 });
  try {
    const r = await fetch(
      `https://api.goodtv.co.kr/onlinebible/bibleread/read-all?version1=0&version2=7&version3=5&bible_code=${ref.code}&jang=${ref.chapter}`,
      { next: { revalidate: 86400 } }
    );
    if (!r.ok) throw new Error(`성경 서버 응답 오류 (${r.status})`);
    const d = (await r.json()).data.data;
    const inRange = (n: number) => ref.ranges.some(([a, b]) => n >= a && n <= b);
    const versions = ["version1", "version2", "version3"].map((k) => ({
      name: d[k].version_name as string,
      verses: (d[k].content as { jul: number; text: string }[])
        .filter((c) => inRange(c.jul))
        .map((c) => ({ n: c.jul, text: c.text })),
    }));
    return NextResponse.json({ ref: passage, versions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "성경 본문을 불러오지 못했습니다." }, { status: 502 });
  }
}
