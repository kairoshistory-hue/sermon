// 사용법: ANTHROPIC_API_KEY=... node scripts/clean-transcript.mjs raw.txt > content/sermons/2026-11-22-judges-10.md
import fs from "node:fs";
const raw = fs.readFileSync(process.argv[2], "utf8");
const res = await fetch("http://localhost:3000/api/clean", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ raw, passcode: process.env.ADMIN_PASSCODE }),
});
const j = await res.json();
if (!res.ok) { console.error(j.error); process.exit(1); }
process.stdout.write(j.markdown);
