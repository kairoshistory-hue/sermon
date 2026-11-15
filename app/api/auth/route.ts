import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { passcode } = await req.json().catch(() => ({}));
  return passcode === (process.env.ADMIN_PASSCODE || "2579") ? NextResponse.json({ ok: true }) : NextResponse.json({ ok: false }, { status: 401 });
}
