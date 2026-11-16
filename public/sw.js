// Yongin Onnuri Church Sermon 서비스 워커: 방문/저장한 페이지를 오프라인에서도 보여 줍니다.
const CACHE = "sermons-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/offline.html")));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

async function networkFirst(req, nav) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: nav });
    if (hit) return hit;
    if (nav) return (await cache.match("/offline.html")) || Response.error();
    return Response.error();
  }
}
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}
async function swr(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (/(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net)$/.test(url.hostname)) e.respondWith(swr(req));
    return;
  }
  if (url.searchParams.has("_rsc") || req.headers.get("RSC")) return; // 클라이언트 이동은 Next가 처리(실패 시 전체 이동 → 아래 navigate에서 캐시 응답)
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/bible")) return;
  if (req.mode === "navigate") return e.respondWith(networkFirst(req, true));
  if (url.pathname.startsWith("/_next/static/")) return e.respondWith(cacheFirst(req));
  if (url.pathname.startsWith("/api/bible")) return e.respondWith(networkFirst(req, false));
  e.respondWith(swr(req));
});
