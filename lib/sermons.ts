import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "sermons");

export type Sermon = {
  slug: string;
  title: string;
  series?: string;
  passage?: string;
  preacher?: string;
  service?: string;
  date: string;
  youtube?: string;
  content: string;
};

export function getAllSermons(): Sermon[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !f.endsWith(".summary.md"))
    .map((f) => readSermon(f.replace(/\.md$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function readSermon(slug: string): Sermon {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    series: data.series,
    passage: data.passage,
    preacher: data.preacher,
    service: data.service,
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    youtube: data.youtube,
    content,
  };
}

export function readSummary(slug: string): string | undefined {
  const f = path.join(DIR, `${slug}.summary.md`);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : undefined;
}
