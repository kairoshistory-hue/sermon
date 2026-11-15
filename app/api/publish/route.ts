import { NextResponse } from "next/server";

const repo = () => process.env.GITHUB_REPO || "kairoshistory-hue/sermon";
const branch = () => process.env.GITHUB_BRANCH || "main";

async function put(path: string, text: string, message: string) {
  const url = `https://api.github.com/repos/${repo()}/contents/${path}`;
  const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "sermon-app", "Content-Type": "application/json" };
  let sha: string | undefined;
  const g = await fetch(`${url}?ref=${branch()}`, { headers });
  if (g.ok) sha = (await g.json()).sha;
  const r = await fetch(url, { method: "PUT", headers, body: JSON.stringify({ message, content: Buffer.from(text, "utf8").toString("base64"), sha, branch: branch() }) });
  if (!r.ok) throw new Error(`GitHub 저장 실패 (${r.status}) ${(await r.text()).slice(0, 160)}`);
}

export async function POST(req: Request) {
  try {
    const { passcode, slug, markdown, summary } = await req.json();
    if (passcode !== (process.env.ADMIN_PASSCODE || "2579")) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    if (!process.env.GITHUB_TOKEN) return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 501 });
    if (!/^[\w-]+$/.test(slug ?? "") || !markdown) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    await put(`content/sermons/${slug}.md`, markdown, `설교 추가: ${slug}`);
    if (summary?.trim()) await put(`content/sermons/${slug}.summary.md`, summary, `요약 추가: ${slug}`);
    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "게시 실패" }, { status: 500 });
  }
}
