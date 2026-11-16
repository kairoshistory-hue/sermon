export const CACHE = "sermons-v1";
export const canOffline = () => typeof window !== "undefined" && "caches" in window;

export async function isSaved(slug: string) {
  if (!canOffline()) return false;
  return !!(await (await caches.open(CACHE)).match(`/sermons/${slug}`));
}
export async function savedCount(slugs: string[]) {
  if (!canOffline()) return 0;
  const c = await caches.open(CACHE);
  const r = await Promise.all(slugs.map((s) => c.match(`/sermons/${s}`)));
  return r.filter(Boolean).length;
}

async function put(cache: Cache, url: string) {
  const res = await fetch(url, { credentials: "same-origin", cache: "reload" });
  if (!res.ok) throw new Error(url);
  await cache.put(url, res.clone());
  return res;
}

// 페이지(HTML)와 화면 구동에 필요한 JS/CSS, 성경 본문을 함께 저장
export async function saveSermon(slug: string, passage?: string) {
  const cache = await caches.open(CACHE);
  const res = await put(cache, `/sermons/${slug}`);
  const html = await res.clone().text();
  const assets = Array.from(new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) ?? []));
  await Promise.all(assets.map(async (a) => { if (!(await cache.match(a))) { try { await put(cache, a); } catch {} } }));
  if (passage) { try { await put(cache, `/api/bible?passage=${encodeURIComponent(passage)}`); } catch {} }
}

export async function saveHome() {
  const cache = await caches.open(CACHE);
  const res = await put(cache, "/");
  const html = await res.clone().text();
  for (const a of new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) ?? [])) { if (!(await cache.match(a))) { try { await put(cache, a); } catch {} } }
}
