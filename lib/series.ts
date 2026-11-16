// "사사기 강해 (9)" → 시리즈명 "사사기 강해", 회차 9
export const seriesName = (s?: string) => (s ? s.replace(/\s*\(\s*\d+\s*\)\s*$/, "").trim() : "");
export const seriesSlug = (n: string) => n.replace(/\s+/g, "-");
export const fromSlug = (slug: string) => { try { return decodeURIComponent(slug).replace(/-/g, " "); } catch { return slug.replace(/-/g, " "); } };
