const repo = () => process.env.GITHUB_REPO || "kairoshistory-hue/sermon";
const branch = () => process.env.GITHUB_BRANCH || "main";
const headers = () => ({ Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "sermon-app", "Content-Type": "application/json" });
const url = (path: string) => `https://api.github.com/repos/${repo()}/contents/${encodeURI(path)}`;

export async function getFile(path: string): Promise<{ text: string; sha: string } | null> {
  const r = await fetch(`${url(path)}?ref=${branch()}`, { headers: headers(), cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub 읽기 실패 (${r.status})`);
  const j = await r.json();
  return { text: Buffer.from(j.content, "base64").toString("utf8"), sha: j.sha };
}

export async function putFile(path: string, text: string, message: string) {
  const old = await getFile(path);
  const r = await fetch(url(path), { method: "PUT", headers: headers(), body: JSON.stringify({ message, content: Buffer.from(text, "utf8").toString("base64"), sha: old?.sha, branch: branch() }) });
  if (!r.ok) throw new Error(`GitHub 저장 실패 (${r.status}) ${(await r.text()).slice(0, 160)}`);
}

export async function deleteFile(path: string, message: string) {
  const old = await getFile(path);
  if (!old) return false;
  const r = await fetch(url(path), { method: "DELETE", headers: headers(), body: JSON.stringify({ message, sha: old.sha, branch: branch() }) });
  if (!r.ok) throw new Error(`GitHub 삭제 실패 (${r.status}) ${(await r.text()).slice(0, 160)}`);
  return true;
}
