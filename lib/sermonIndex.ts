import { getAllSermons } from "./sermons";
import { bookCode } from "./bible";

export type SermonItem = { slug: string; title: string; series?: string; passage?: string; preacher?: string; church?: string; date: string; book: number | null };

export function sermonItems(): SermonItem[] {
  return getAllSermons().map(({ slug, title, series, passage, preacher, church, date }) => ({ slug, title, series, passage, preacher, church, date, book: bookCode(passage) }));
}

// 찾기용: 본문을 짧은 일반 텍스트로
export function searchItems() {
  return getAllSermons().map((s) => ({
    slug: s.slug, title: s.title, series: s.series, passage: s.passage, preacher: s.preacher, date: s.date,
    text: s.content.replace(/^#+\s*/gm, "").replace(/^>\s?/gm, "").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim(),
  }));
}
